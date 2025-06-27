module.exports = {
  branches: 'main',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/npm',
    [
      '@semantic-release/github',
      {
        // Prevent comments on dependabot PRs
        successCommentCondition: '<% return issue.user.type !== "Bot"; %>',
      },
    ],
    '@semantic-release/git',
  ],
};
