// BASIC MESSAGE STRUCTURE (JSON)
// -------------------------------
// [
//   {
//     "role": "user",
//     "content": "Explain Pythagoras theorem with an example."
//   }
// ]


// ROLES IN OPENAI / AZURE OPENAI MESSAGES
// ---------------------------------------

// 1. system
//    - Purpose: Sets the behavior, tone, and rules for the model.
//    - Example: "You are a helpful assistant that answers questions concisely."

// 2. user
//    - Purpose: Represents input from the actual end-user.
//    - Example: "Explain the difference between supervised and unsupervised learning."

// 3. assistant
//    - Purpose: Represents the model's previous responses.
//    - Used to keep conversation context.
//    - Example: "Supervised learning uses labeled data, while unsupervised learning does not."

// 4. tool/function
//    - Purpose: Represents data coming from an external tool or function call.
//    - Example: {"temperature": "30°C", "condition": "Sunny"}


// BASIC MESSAGE STRUCTURE (JSON)
// -------------------------------
// [
//   {
//     "role": "system",
//     "content": "You are a helpful assistant that answers questions concisely."
//   },
//   {
//     "role": "user",
//     "content": "Explain Pythagoras theorem with an example."
//   },
// ]



// -------------------------------
// [
//   {
//     "role": "system",
//     "content": "You are a helpful assistant that answers questions concisely."
//   },
//   {
//     "role": "user",
//     "content": "Explain Pythagoras theorem with an example."
//   },
//   {
//     "role": "assistant",
//     "content": "Assistant answer."
//   },
//   {
//     "role": "user",
//     "content": "next question"
//   },
//   {
//     "role": "assistant",
//     "content": "Assistant answer."
//   }
// ]

