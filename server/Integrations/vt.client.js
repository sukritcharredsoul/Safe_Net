import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const VT_BASE_URL = 'https://www.virustotal.com/api/v3';

const headers = {
    'x-apikey': process.env.VIRUS_TOTAL
};


// ─────────────────────────────────────────────
// 🔹 FILE SCAN
// ─────────────────────────────────────────────

export const scanFileWithVT = async (filePath) => {
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));

        const response = await axios.post(
            `${VT_BASE_URL}/files`,
            form,
            {
                headers: {
                    ...headers,
                    ...form.getHeaders()
                }
            }
        );

        return response.data;

    } catch (error) {
        throw new Error('VirusTotal file upload failed');
    }
};


// ─────────────────────────────────────────────
// 🔹 GET FILE ANALYSIS REPORT
// ─────────────────────────────────────────────

export const getAnalysisReport = async (analysisId) => {
    try {
        const response = await axios.get(
            `${VT_BASE_URL}/analyses/${analysisId}`,
            { headers }
        );

        return response.data;

    } catch (error) {
        throw new Error('Failed to fetch analysis report');
    }
};


// ─────────────────────────────────────────────
// 🔹 URL SCAN
// ─────────────────────────────────────────────

export const scanUrlWithVT = async (url) => {
    try {
        const response = await axios.post(
            `${VT_BASE_URL}/urls`,
            new URLSearchParams({ url }),
            {
                headers: {
                    ...headers,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return response.data;

    } catch (error) {
        throw new Error('VirusTotal URL scan failed');
    }
};


// ─────────────────────────────────────────────
// 🔹 GET URL REPORT
// ─────────────────────────────────────────────

export const getUrlReport = async (urlId) => {
    try {
        const response = await axios.get(
            `${VT_BASE_URL}/urls/${urlId}`,
            { headers }
        );

        return response.data;

    } catch (error) {
        throw new Error('Failed to fetch URL report');
    }
};


// ─────────────────────────────────────────────
// 🔹 DOMAIN REPORT
// ─────────────────────────────────────────────

export const getDomainReport = async (domain) => {
    try {
        const response = await axios.get(
            `${VT_BASE_URL}/domains/${domain}`,
            { headers }
        );

        return response.data;

    } catch (error) {
        throw new Error('Failed to fetch domain report');
    }
};


// ─────────────────────────────────────────────
// 🔹 IP REPORT
// ─────────────────────────────────────────────

export const getIPReport = async (ip) => {
    try {
        const response = await axios.get(
            `${VT_BASE_URL}/ip_addresses/${ip}`,
            { headers }
        );

        return response.data;

    } catch (error) {
        throw new Error('Failed to fetch IP report');
    }
};