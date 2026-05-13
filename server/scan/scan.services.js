import crypto from 'crypto';
import fs from 'fs';
import FileHistory from './scanHistory.model.js';
import { logActivity } from '../activity/activity.service.js';

import {
  scanFileWithVT,
  getAnalysisReport,
  scanUrlWithVT,
  getDomainReport,
  getIPReport
} from '../Integrations/vt.client.js';




// File hash generation : 

const fileHash = (filePath) => {
    const fileBuffer = fs.readFileSync(filePath) ;
    return crypto.createHash('sha256').update(fileBuffer).digest('hex') ;
}

const calculateRiskLevel = (malicious, total) => {
    const ratio = total === 0 ? 0 : malicious / total;

    if (ratio > 0.3) return "high";
    if (ratio > 0.1) return "medium";
    return "low";
};



export const scanFileService = async (file, userId) => {
    const filePath = file.path;

    // 1. Hash
    const fileHash = generateFileHash(filePath);

    // 2. Check DB (deduplication)
    const existing = await FileHistory.findOne({ fileHash });

    if (existing && existing.scanStatus === "completed") {
        return { source: "cache", data: existing };
    }

    if (existing && existing.scanStatus === "pending") {
        return { source: "pending", data: existing };
    }

    // 3. Create new entry
    const entry = await FileHistory.create({
        userId,
        originalFileName: file.originalname,
        fileHash,
        maliciousCount: 0,
        harmlessCount: 0,
        totalEngines: 0,
        scanStatus: "pending"
    });

    try {
        // 4. Send to VirusTotal
        const vtUpload = await scanFileWithVT(filePath);
        const analysisId = vtUpload.data.id;

        // 5. Poll result (basic version)
        let report;
        let attempts = 0;

        while (attempts < 10) {
            report = await getAnalysisReport(analysisId);

            if (report.data.attributes.status === "completed") break;

            await new Promise(res => setTimeout(res, 3000));
            attempts++;
        }

        const stats = report.data.attributes.stats;

        const malicious = stats.malicious || 0;
        const harmless = stats.harmless || 0;
        const total = Object.values(stats).reduce((a, b) => a + b, 0);

        const riskLevel = calculateRiskLevel(malicious, total);

        // 6. Update DB
        const updated = await FileHistory.findByIdAndUpdate(
            entry._id,
            {
                maliciousCount: malicious,
                harmlessCount: harmless,
                totalEngines: total,
                riskLevel,
                scanStatus: "completed",
                scanId: analysisId
            },
            { new: true }
        );

        // 7. Log activity
        await logActivity({
            userId,
            actionType: "FILE_SCAN",
            input: file.originalname,
            result: {
                riskScore: malicious,
                riskLevel
            },
            fileHistoryId: updated._id
        });

        return { source: "virustotal", data: updated };

    } catch (error) {
        await FileHistory.findByIdAndUpdate(entry._id, {
            scanStatus: "failed"
        });

        throw new Error("File scan failed");
    }
};


// ─────────────────────────────────────────────
// 🔹 URL SCAN
// ─────────────────────────────────────────────

export const scanUrlService = async (url, userId) => {
    try {
        const vtResponse = await scanUrlWithVT(url);
        const analysisId = vtResponse.data.id;

        // (Optional) You can poll like file, but skipping for now

        await logActivity({
            userId,
            actionType: "URL_SCAN",
            input: url,
            result: {
                riskLevel: "unknown"
            }
        });

        return {
            message: "URL submitted for scanning",
            analysisId
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
        const data = await getDomainReport(domain);
        return data;
    } catch (error) {
        throw new Error("Domain report failed");
    }
};


// ─────────────────────────────────────────────
// 🔹 IP REPORT
// ─────────────────────────────────────────────

export const getIPReportService = async (ip) => {
    try {
        const data = await getIPReport(ip);
        return data;
    } catch (error) {
        throw new Error("IP report failed");
    }
};