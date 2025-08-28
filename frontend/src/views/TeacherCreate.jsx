import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createPoll } from "../services/api.js";
import { setPollMeta } from "../store/pollSlice.js";

export default function TeacherCreate() {
  const [question, setQuestion] = useState("");
  const [timeLimit, setTimeLimit] = useState(60);
  const [options, setOptions] = useState(["", ""]);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const updateAnswer = (index, value) => {
    setAnswers({ ...answers, [index]: value });
  };

  async function onCreate() {
    const res = await createPoll({
      title: question,
      timeLimitSeconds: Number(timeLimit),
      options,
      answers,
    });
    dispatch(setPollMeta({ pollId: res.pollId, title: res.title }));
    navigate(`/teacher/${res.pollId}`);
  }

  return (
    <div className="flex justify-center w-full min-h-screen bg-white">
      <div className="w-full max-w-4xl px-6 py-10">
        {/* Badge */}
        <div className="mb-6">
          <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
            Interview Poll
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold">
          Let’s <span className="text-black">Get Started</span>
        </h1>
        <p className="text-gray-500 mt-2 mb-8">
          you’ll have the ability to create and manage polls, ask questions, and
          monitor your students’ responses in real-time.
        </p>

        {/* Question Input */}
        <div className="mb-6">
          <label className="font-semibold text-gray-800">Enter your question</label>
          <div className="flex items-center justify-between mt-2">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question..."
              className="w-full h-28 border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select
              className="ml-4 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
            >
              <option value={30}>30 seconds</option>
              <option value={60}>60 seconds</option>
              <option value={120}>120 seconds</option>
              <option value={300}>300 seconds</option>
            </select>
          </div>
          <p className="text-right text-sm text-gray-400 mt-1">
            {question.length}/100
          </p>
        </div>

        {/* Options */}
        <div className="mb-6">
          <div className="flex justify-between font-semibold text-gray-800 mb-3">
            <span>Edit Options</span>
            <span>Is it Correct?</span>
          </div>

          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center mb-3 gap-6">
              <span className="w-6 h-6 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                {idx + 1}
              </span>
              <input
                value={opt}
                onChange={(e) => updateOption(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex gap-3 items-center">
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name={`correct-${idx}`}
                    checked={answers[idx] === "yes"}
                    onChange={() => updateAnswer(idx, "yes")}
                    className="accent-purple-600"
                  />
                  Yes
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name={`correct-${idx}`}
                    checked={answers[idx] === "no"}
                    onChange={() => updateAnswer(idx, "no")}
                    className="accent-purple-600"
                  />
                  No
                </label>
              </div>
            </div>
          ))}

          {/* Add More Option Button */}
          <button
            onClick={addOption}
            className="mt-2 text-purple-600 border border-purple-400 rounded-md px-4 py-2 text-sm hover:bg-purple-50"
          >
            + Add More option
          </button>
        </div>

        {/* Bottom Action */}
        <div className="flex justify-end border-t pt-6">
          <button
            onClick={onCreate}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-medium"
          >
            Ask Question
          </button>
        </div>
      </div>
    </div>
  );
}
