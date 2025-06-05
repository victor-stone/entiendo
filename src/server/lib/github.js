// reportBug.js
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
//console.log('Github token: ', process.env.GITHUB_TOKEN)
/**
 * Creates a GitHub issue for a bug report.
 * @param {string} title - The title of the bug.
 * @param {string} body - The description of the bug.
 * @returns {Promise<{ success: boolean, url?: string, error?: string }>}
 */
export async function reportBug({ title, body, labels }) {
  try {
    const response = await octokit.rest.issues.create({
      owner: "victor-stone",
      repo: "entiendo",
      title,
      body,
      labels
    });

    return { success: true, url: response.data.html_url };
  } catch (err) {
    console.error("GitHub Issue Error:", err);
    return { success: false, error: err.message };
  }
}