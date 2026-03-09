import Feedback from "../models/Feedback.js";

export const sendFeedback = async (req, res) => {
  try {
    const { subject, message } = req.body;

    const feedback = await Feedback.create({
      subject,
      message,
      studentID: req.student._id
    });

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate("studentID", "name");

    res.status(201).json({
      message: "Feedback sent",
      feedback: populatedFeedback
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const respondToFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    feedback.response = response;
    feedback.status = "responded";

    await feedback.save();

    res.status(200).json({
      message: "Response sent",
      feedback
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("studentID", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(feedbacks);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
