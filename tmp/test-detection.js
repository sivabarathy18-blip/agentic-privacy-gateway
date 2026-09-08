const NON_NAME_WORDS = new Set([
  'The', 'This', 'That', 'These', 'Those', 'Please', 'Thank', 'Thanks', 'Write', 'Draft',
  'Send', 'Check', 'Update', 'Review', 'Verify', 'Confirm', 'Cancel', 'Delete', 'Remove',
  'Good', 'Great', 'Best', 'Dear', 'Hello', 'Notice', 'Warning', 'Alert', 'Attention',
  'Subject', 'Regarding', 'Important', 'Urgent', 'Confidential', 'Restricted', 'Internal',
  'Customer', 'Client', 'Patient', 'User', 'Employee', 'Caller', 'Contact', 'Account',
  'Number', 'Card', 'Credit', 'Debit', 'Invoice', 'Payment', 'Transaction', 'Refund',
  'Report', 'Summary', 'Document', 'Record', 'Details', 'Profile', 'Settings', 'Policy',
  'Agreement', 'Contract', 'Terms', 'Conditions', 'Overview', 'Status', 'Action', 'Item',
  'UPI', 'ID', 'PAN', 'Aadhaar', 'SSN', 'API', 'Key', 'Token', 'Secret', 'Password',
  'Passwd', 'Pass', 'Bearer', 'Auth', 'Email', 'Phone', 'Mobile', 'Cell', 'Bank',
  'Chief', 'Technology', 'Officer', 'Director', 'Manager', 'Engineer', 'Support', 'Service'
]);

function isLikelyPersonName(candidate) {
  const parts = candidate.trim().split(/\s+/);
  if (parts.length < 2 || parts.length > 3) return false;
  for (const part of parts) {
    if (NON_NAME_WORDS.has(part)) return false;
    if (/^[A-Z]{2,}$/.test(part)) return false;
    if (!/^[A-Z][a-zA-Z'\-]*$/.test(part)) return false;
  }
  return true;
}

const inputs = [
  "Customer Rahul Kumar's email is rahul@example.com. His phone number is 9876543210. Write a professional apology.",
  "Verify customer Priya Sharma for refund. PAN is ABCDE1234F, Aadhaar number is 9876 5432 1098, Bank account is 918273645281, and UPI ID is priya@okaxis. Confirm refund eligibility.",
  "Draft a follow-up for Carlos Mendoza, email carlos@acme.org, phone +1 555-0199.",
  "STRICTLY CONFIDENTIAL AND PROPRIETARY: Executive compensation summary for Chief Technology Officer Mark Vance at internal IP address 192.168.1.105. Draft the board report."
];

const rolePrefixes = "(?:Customer|Client|Patient|User|Employee|Caller|Contact|Account\\s*holder|Sender|Recipient|Assignee|Attendee|Candidate|Student|Doctor|Nurse|Partner|Author|Member|Subject|Passenger)";
const contextualRegex = new RegExp("(?:(?:" + rolePrefixes + ")\\s*(?:name)?[:\\s]+)([A-Z][a-zA-Z'\\-]+(?:\\s+[A-Z][a-zA-Z'\\-]+){0,2})\\b", "g");

for (const inp of inputs) {
  console.log("\nINPUT:", inp.substring(0, 45));
  let m;
  contextualRegex.lastIndex = 0;
  while ((m = contextualRegex.exec(inp)) !== null) {
    let rawName = m[1].replace(/'s$/i, "").trim();
    console.log("Contextual Match:", rawName);
  }
  const pnRegex = /\b([A-Z][a-zA-Z'\\-]{1,20}\s+[A-Z][a-zA-Z'\\-]{1,20})\b/g;
  while ((m = pnRegex.exec(inp)) !== null) {
    let clean = m[1].replace(/'s$/i, "").trim();
    if (isLikelyPersonName(clean)) {
      console.log("Proper Noun Match:", clean);
    }
  }
}
