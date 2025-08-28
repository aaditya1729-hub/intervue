import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setRole, setName, setPollId } from "../store/userSlice.js";
import { useState } from "react";
import classNames from "classnames";

export default function Landing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [role, setRoleLocal] = useState("student"); // default Student selected

  function start() {
    dispatch(setRole(role));
    dispatch(setName("Guest")); // default since no name input
    if (role === "teacher") {
      navigate("/teacher/create");
    } else {
      dispatch(setPollId("demo_poll")); // placeholder
      navigate(`/student/demo_poll`);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      {/* Centered container */}
      <div className="w-full max-w-[1080px] text-center">
        {/* Top Badge */}
        <div className="flex justify-center mb-8">
          <span className="px-4 py-1 text-sm font-medium text-white bg-[#4F0DCE] rounded-full">
            Intervue Poll
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-semibold text-[#000000]">
          Welcome to the <span className="text-[#4F0DCE]">Live Polling System</span>
        </h1>
        <p className="mt-2 text-[#6E6E6E]">
          Please select the role that best describes you to begin using the live polling system.
        </p>

        {/* Role Selection - Side by Side */}
        <div className="flex flex-row gap-6 w-full mt-10">
          {/* Student Card */}
          <button
            onClick={() => setRoleLocal("student")}
            className={classNames(
              "w-1/2 p-8 border rounded-2xl text-left transition-all",
              role === "student"
                ? "border-[#4F0DCE] shadow-md"
                : "border-gray-300 hover:border-[#6E6E6E]"
            )}
          >
            <h2 className="font-semibold text-[#000000] text-lg">I’m a Student</h2>
            <p className="mt-2 text-sm text-[#6E6E6E]">
              Join a poll by entering the code provided by your teacher.
            </p>
          </button>

          {/* Teacher Card */}
          <button
            onClick={() => setRoleLocal("teacher")}
            className={classNames(
              "w-1/2 p-8 border rounded-2xl text-left transition-all",
              role === "teacher"
                ? "border-[#4F0DCE] shadow-md"
                : "border-gray-300 hover:border-[#6E6E6E]"
            )}
          >
            <h2 className="font-semibold text-[#000000] text-lg">I’m a Teacher</h2>
            <p className="mt-2 text-sm text-[#6E6E6E]">
              Create polls and view live results in real-time.
            </p>
          </button>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={start}
            className="mt-16 px-14 py-3 rounded-full bg-[#4F0DCE] text-white font-medium shadow hover:bg-[#3B0AAA] transition"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
