import crypto from 'crypto';
import fs from 'fs';
import axios from "axios";

import FileHistory from './scanHistory.model.js';
import { logActivity } from '../activity/activity.service.js';

import {
  scanFileWithVT,
  getAnalysisReport,
  getDomainReport,
  getIPReport
} from '../Integrations/vt.client.js';

const API_KEY = process.env.VT_API_KEY;

// ─────────────────────────────────────────────
// 🔹 FILE HASH GENERATION
// ─────────────────────────────────────────────
const generateFileHash = (filePath) => {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};

// ─────────────────────────────────────────────
// 🔹 RISK LEVEL CALCULATION
// ─────────────────────────────────────────────
const calculateRiskLevel = (score) => {
    if (score > 70) return "HIGH";
    if (score > 40) return "MEDIUM";
    return "LOW";
};

// ─────────────────────────────────────────────
// 🔹 FILE SCAN SERVICE
// ─────────────────────────────────────────────
export const scanFileService = async (file, userId) => {
    const filePath = file.path;

    const fileHash = generateFileHash(filePath);

    const existing = await FileHistory.findOne({ fileHash });

    if (existing && existing.scanStatus === "completed") {
        return { source: "cache", data: existing };
    }

    if (existing && existing.scanStatus === "pending") {
        return { source: "pending", data: existing };
    }

    const entry = await FileHistory.create({
        userId,
        originalFileName: file.originalname,
        fileHash,
        maliciousCount: 0,
        harmlessCount: 0,
        totalEngines: 0,
        riskScore: 0,
        riskLevel: "LOW",
        scanStatus: "pending"
    });

    try {
        const vtUpload = await scanFileWithVT(filePath);
        const analysisId = vtUpload.data.id;

        let report;
        let attempts = 0;
        const MAX_ATTEMPTS = 15;

        while (attempts < MAX_ATTEMPTS) {
            report = await getAnalysisReport(analysisId);

            if (report.data.attributes.status === "completed") break;

            await new Promise(res => setTimeout(res, 2500));
            attempts++;
        }

        if (!report || report.data.attributes.status !== "completed") {
            throw new Error("Scan timeout");
        }

        const stats = report.data.attributes.stats || {};

        const malicious = stats.malicious || 0;
        const harmless = stats.harmless || 0;
        const total = Object.values(stats).reduce((a, b) => a + b, 0) || 1;

        const riskScore = Math.min(
            100,
            Math.round((malicious / total) * 100)
        );

        const riskLevel = calculateRiskLevel(riskScore);

        const updated = await FileHistory.findByIdAndUpdate(
            entry._id,
            {
                maliciousCount: malicious,
                harmlessCount: harmless,
                totalEngines: total,
                riskScore,
                riskLevel,
                scanStatus: "completed",
                scanId: analysisId
            },
            { new: true }
        );

        await logActivity({
            userId,
            actionType: "FILE_SCAN",
            input: file.originalname,
            result: { riskScore, riskLevel },
            fileHistoryId: updated._id
        });

        return {
            source: "virustotal",
            data: updated
        };

    } catch (error) {
        await FileHistory.findByIdAndUpdate(entry._id, {
            scanStatus: "failed"
        });

        throw new Error("File scan failed");
    }
};

// ─────────────────────────────────────────────
// 🔹 URL SCAN SERVICE
// ─────────────────────────────────────────────
export const scanUrlService = async (url, userId) => {
    try {
        const submitRes = await axios.post(
            "https://www.virustotal.com/api/v3/urls",
            new URLSearchParams({ url }),
            {
                headers: {
                    "x-apikey": API_KEY,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        const analysisId = submitRes.data.data.id;

        let status = "queued";
        let analysisData;
        let attempts = 0;

        while (status !== "completed" && attempts < 15) {
            const res = await axios.get(
                `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
                { headers: { "x-apikey": API_KEY } }
            );

            status = res.data.data.attributes.status;
            analysisData = res.data.data.attributes;

            if (status !== "completed") {
                await new Promise(r => setTimeout(r, 2500));
                attempts++;
            }
        }

        if (!analysisData || status !== "completed") {
            throw new Error("Scan timeout");
        }

        const stats = analysisData.stats || {};
        const total = Object.values(stats).reduce((a, b) => a + b, 0) || 1;

        const riskScore = Math.min(
            100,
            Math.round(
                ((stats.malicious * 25) + (stats.suspicious * 10)) / total * 100
            )
        );

        const riskLevel = calculateRiskLevel(riskScore);

        const results = analysisData.results || {};

        const topThreats = Object.entries(results)
            .filter(([_, val]) => val.category === "malicious")
            .slice(0, 5)
            .map(([engine, val]) => ({
                engine,
                result: val.result
            }));

        await logActivity({
            userId,
            actionType: "URL_SCAN",
            input: url,
            result: { riskScore, riskLevel }
        });

        return {
            source: "virustotal",
            data: {
                url,
                status,
                riskScore,
                riskLevel,
                stats,
                topThreats
            }
        };

    } catch (error) {
        throw new Error("URL scan failed");
    }
};

// ─────────────────────────────────────────────
// 🔹 DOMAIN REPORT
// ─────────────────────────────────────────────
export const getDomainReportService = async (domain) => {
    try {
        const res = await getDomainReport(domain);

        const stats = res.data.attributes.last_analysis_stats || {};

        return {
            domain,
            stats,
            reputation: res.data.attributes.reputation
        };

    } catch (error) {
        throw new Error("Domain report failed");
    }
};

// ─────────────────────────────────────────────
// 🔹 IP REPORT
// ─────────────────────────────────────────────
export const getIPReportService = async (ip) => {
    try {
        const res = await getIPReport(ip);

        const stats = res.data.attributes.last_analysis_stats || {};

        return {
            ip,
            stats,
            reputation: res.data.attributes.reputation
        };

    } catch (error) {
        throw new Error("IP report failed");
    }
};