"""Universal legal element roles; domains are data, not code."""

ELEMENT_ROLES = (
    "actors",
    "conditions",
    "prohibited_act",
    "intent",
    "exception",
    "consequence",
    "procedure",
    "forum",
    "evidence",
    "time_limit",
    "remedy",
    "authority",
    "backfire",
)

ROLE_QUESTIONS = {
    "actors": "Who are the parties and what relationship or duty connects them?",
    "conditions": "What facts or conditions must be true for this issue to arise?",
    "prohibited_act": "What act is prohibited, required, or regulated?",
    "intent": "What mental state, intention, knowledge, or negligence is required?",
    "exception": "What defence, exception, exemption, or lawful justification applies?",
    "consequence": "What penalty, liability, or legal consequence follows?",
    "procedure": "What steps, notice, filing, or process does the law require?",
    "forum": "Which court, tribunal, authority, or office decides it?",
    "evidence": "What evidence, documents, witnesses, or proof are required?",
    "time_limit": "What limitation period, deadline, or time limit applies?",
    "remedy": "What remedy, relief, compensation, or order is available?",
    "authority": "Which Act and section is the source of this element?",
    "backfire": "What consequence follows for a false, malicious, or abusive claim?",
}
