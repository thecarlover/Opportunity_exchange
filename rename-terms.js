const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /businessId/g, to: 'posterId' },
  { from: /providerId/g, to: 'applicantId' },
  { from: /\bbusiness\b/g, to: 'poster' },
  { from: /\bprovider\b/g, to: 'applicant' },
  { from: /\bProblem\b/g, to: 'Opportunity' },
  { from: /\bproblem\b/g, to: 'opportunity' },
  { from: /\bProblems\b/g, to: 'Opportunities' },
  { from: /\bproblems\b/g, to: 'opportunities' },
  { from: /\bProposal\b/g, to: 'Application' },
  { from: /\bproposal\b/g, to: 'application' },
  { from: /\bProposals\b/g, to: 'Applications' },
  { from: /\bproposals\b/g, to: 'applications' },
  { from: /problemId/g, to: 'opportunityId' },
  { from: /proposalId/g, to: 'applicationId' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const { from, to } of replacements) {
        if (from.test(content)) {
          content = content.replace(from, to);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'app'));
processDirectory(path.join(__dirname, 'components'));
