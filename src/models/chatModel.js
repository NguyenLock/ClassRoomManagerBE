const db = require("../config/firebase");

exports.getChatHistory = async (
  userType,
  identifier,
  recipientEmail = null
) => {
  try {
    const chatRef = db.collection("chats");
    let query;

    if (userType === "student") {
      query = chatRef.where("studentEmail", "==", identifier);
    } else if (userType === "instructor" && recipientEmail) {
      query = chatRef.where("studentEmail", "==", recipientEmail);
    } else {
      throw new Error("Invalid parameters for chat history");
    }

    const snapshot = await query.orderBy("timestamp", "desc").limit(100).get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw error;
  }
};

exports.saveMessage = async (message) => {
  try {
    const chatRef = db.collection("chats");
    const result = await chatRef.add({
      ...message,
      timestamp: new Date(),
    });
    return result.id;
  } catch (error) {
    throw error;
  }
};
