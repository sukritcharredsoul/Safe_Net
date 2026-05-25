import {
    scanFileService,
    scanUrlService,
    getDomainReportService,
    getIPReportService
} from './scan.services.js';


// ─────────────────────────────────────────────
// 🔹 FILE SCAN CONTROLLER
// ─────────────────────────────────────────────

export const scanFileController = async (req, res) => {
    try {
        const file = req.file;
        const userId = req.user._id;

        if (!file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }

        const result = await scanFileService(file, userId);

        return res.status(200).json({
            message: "File scan processed",
            source: result.source,
            data: result.data
        });

    } catch (error) {
        console.error("File Scan Error:", error.message);

        return res.status(500).json({
            message: error.message || "File scan failed"
        });
    }
};


// ─────────────────────────────────────────────
// 🔹 URL SCAN CONTROLLER
// ─────────────────────────────────────────────

export const scanUrlController = async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                message: "URL is required"
            });
        }

        const result = await scanUrlService(url);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("URL Scan Error:", error.message);

        return res.status(500).json({
            message: error.message || "URL scan failed"
        });
    }
};

// ─────────────────────────────────────────────
// 🔹 DOMAIN REPORT CONTROLLER
// ─────────────────────────────────────────────

export const getDomainReportController = async (req, res) => {
    try {
        const { domain } = req.query;

        if (!domain) {
            return res.status(400).json({
                message: "Domain is required"
            });
        }

        const data = await getDomainReportService(domain);

        return res.status(200).json(data);

    } catch (error) {
        console.error("Domain Report Error:", error.message);

        return res.status(500).json({
            message: error.message || "Domain report failed"
        });
    }
};


// ─────────────────────────────────────────────
// 🔹 IP REPORT CONTROLLER
// ─────────────────────────────────────────────

export const getIPReportController = async (req, res) => {
    try {
        const { ip } = req.query;

        if (!ip) {
            return res.status(400).json({
                message: "IP is required"
            });
        }

        const data = await getIPReportService(ip);

        return res.status(200).json(data);

    } catch (error) {
        console.error("IP Report Error:", error.message);

        return res.status(500).json({
            message: error.message || "IP report failed"
        });
    }
};


import { getAnalysisReport } from '../Integrations/vt.client.js';

export const getUrlReportController = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                message: "analysisId is required"
            });
        }

        const report = await getAnalysisReport(id);

        return res.status(200).json(report);

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch URL report"
        });
    }
};