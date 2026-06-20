const { Octokit } = require('@octokit/rest');
const logger = require('../config/logger');
const aiService = require('./aiService');

class GitHubService {
  getConfig(agent, key) {
    if (agent.configuration instanceof Map) {
      return agent.configuration.get(key);
    }
    return agent.configuration?.[key];
  }

  async handleOperation(message, agent) {
    try {
      const token = this.getConfig(agent, 'githubToken');
      const octokit = new Octokit({ auth: token });

      const operationResponse = await aiService.callHuggingFace(
        message,
        "You are a helpful assistant that determines what GitHub operation to perform. Extract the repository, owner, and PR number from the message. Respond in JSON format: { operation: 'summarize_pr', owner: 'owner', repo: 'repo', pr_number: number }. Just return formatted JSON"
      );

      logger.info('GitHub operation response:', operationResponse);

      let operation;
      try {
        const jsonMatch = operationResponse.match(/\{.*\}/);
        if (jsonMatch) {
          operation = JSON.parse(jsonMatch[0]);
          logger.info('Parsed operation:', operation);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (error) {
        logger.error('Error parsing operation response:', error);
        return {
          content: "I'm sorry, I couldn't understand what GitHub operation you want to perform.",
          sender: 'agent',
          timestamp: new Date().toISOString()
        };
      }

      if (operation.operation === 'summarize_pr') {
        return await this.summarizePR(octokit, operation);
      }

      return {
        content: "I'm sorry, I couldn't understand what GitHub operation you want to perform.",
        sender: 'agent',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('GitHub operation error:', error);
      return {
        content: "I'm sorry, there was an error processing your GitHub request.",
        sender: 'agent',
        timestamp: new Date().toISOString()
      };
    }
  }

  async summarizePR(octokit, operation) {
    try {
      const { data: pr } = await octokit.pulls.get({
        owner: operation.owner,
        repo: operation.repo,
        pull_number: operation.pr_number
      });

      const { data: commits } = await octokit.pulls.listCommits({
        owner: operation.owner,
        repo: operation.repo,
        pull_number: operation.pr_number
      });

      const { data: files } = await octokit.pulls.listFiles({
        owner: operation.owner,
        repo: operation.repo,
        pull_number: operation.pr_number
      });

      const summary = await aiService.callHuggingFace(
        `Summarize this PR:
          Title: ${pr.title}
          Description: ${pr.body}
          Number of commits: ${commits.length}
          Files changed: ${files.length}
          Files: ${files.map(f => f.filename).join(', ')}`,
        "You are a helpful assistant that summarizes GitHub pull requests. Provide a concise summary of the changes."
      );
      return {
        content: summary,
        sender: 'agent',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error summarizing PR:', error);
      throw error;
    }
  }
}

module.exports = new GitHubService(); 