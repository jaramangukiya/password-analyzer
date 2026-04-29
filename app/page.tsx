"use client";

import { useState } from "react";

type ResultType = {
  strength: string;
  color: string;
  entropy: string;
  times: {
    MD5: string;
    "SHA-256": string;
    bcrypt: string;
  };
  hash: string;
  score: number;
};

export default function Home() {
  const [password, setPassword] = useState<string>("");
  const [data, setData] = useState<ResultType | null>(null);

  const analyze = async () => {
    if (!password) return;

    let charset = 0;
    if (/[a-z]/.test(password)) charset += 26;
    if (/[A-Z]/.test(password)) charset += 26;
    if (/[0-9]/.test(password)) charset += 10;
    if (/[^A-Za-z0-9]/.test(password)) charset += 32;

    const entropy = password.length * Math.log2(charset || 1);

    let strength = "Weak";
    let color = "text-red-400";
    let score = 33;

    if (entropy > 60) {
      strength = "Strong";
      color = "text-green-400";
      score = 100;
    } else if (entropy > 40) {
      strength = "Medium";
      color = "text-yellow-400";
      score = 66;
    }

    const combinations = Math.pow(charset, password.length);

    const speeds: Record<string, number> = {
      MD5: 1e11,
      "SHA-256": 1e10,
      bcrypt: 1e3,
    };

    const formatTime = (sec: number): string => {
      if (sec < 60) return sec.toFixed(2) + " sec";
      if (sec < 3600) return (sec / 60).toFixed(2) + " min";
      if (sec < 86400) return (sec / 3600).toFixed(2) + " hrs";
      if (sec < 31536000) return (sec / 86400).toFixed(2) + " days";
      return (sec / 31536000).toFixed(2) + " years";
    };

    const times: any = {};
    for (const key in speeds) {
      times[key] = formatTime(combinations / speeds[key]);
    }

    const res = await fetch("/api/hash", {
      method: "POST",
      body: JSON.stringify({ password }),
    });

    const hashData = await res.json();

    setData({
      strength,
      color,
      entropy: entropy.toFixed(2),
      times,
      hash: hashData.hashed,
      score,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-6">

      <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-xl">

        <h1 className="text-3xl font-bold text-center text-white mb-6">
          🔐 Password Security Analyzer
        </h1>

        <input
          type="text"
          placeholder="Enter your password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        <button
          onClick={analyze}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-all text-white p-3 rounded-xl font-semibold"
        >
          Analyze Password
        </button>

        {data && (
          <div className="mt-6 text-white">

            {/* Strength */}
            <p className={`text-xl font-semibold ${data.color}`}>
              Strength: {data.strength}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-3 mt-2">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${data.score}%`,
                  background:
                    data.score === 100
                      ? "#22c55e"
                      : data.score === 66
                      ? "#facc15"
                      : "#ef4444",
                }}
              ></div>
            </div>

            {/* Entropy */}
            <p className="mt-3 text-gray-300">
              Entropy: <span className="text-white font-semibold">{data.entropy} bits</span>
            </p>

            {/* Crack Time */}
            <div className="mt-5">
              <h3 className="font-semibold text-lg mb-2">⏱ Crack Time</h3>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-800 p-3 rounded-xl">
                  <p className="text-sm text-gray-400">MD5</p>
                  <p className="font-semibold">{data.times.MD5}</p>
                </div>

                <div className="bg-gray-800 p-3 rounded-xl">
                  <p className="text-sm text-gray-400">SHA-256</p>
                  <p className="font-semibold">{data.times["SHA-256"]}</p>
                </div>

                <div className="bg-gray-800 p-3 rounded-xl">
                  <p className="text-sm text-gray-400">bcrypt</p>
                  <p className="font-semibold">{data.times.bcrypt}</p>
                </div>
              </div>
            </div>

            {/* Hash Output */}
            <div className="mt-5">
              <h3 className="font-semibold mb-2">🔑 bcrypt Hash</h3>
              <p className="text-xs bg-black/50 p-3 rounded-xl break-all">
                {data.hash}
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}