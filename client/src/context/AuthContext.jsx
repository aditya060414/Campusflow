import React, { createContext, useState } from "react";

export const AuthContext = createContext(null);

const STUDENT_STORAGE_KEYS = ["student", "cf_student"];

const normalizeStudent = (studentData) => {
  if (!studentData) return null;

  return {
    ...studentData,
    student_id:
      studentData.student_id ||
      studentData.id ||
      studentData._id ||
      studentData.userId ||
      "",
    name: studentData.name || studentData.username || studentData.email || "Student",
  };
};

const loadStoredStudent = () => {
  for (const key of STUDENT_STORAGE_KEYS) {
    try {
      const savedStudent = localStorage.getItem(key);
      const parsed = savedStudent ? normalizeStudent(JSON.parse(savedStudent)) : null;
      if (parsed?.student_id) return parsed;
    } catch (e) {
      console.error(`Failed to parse student data from localStorage key "${key}":`, e);
    }
  }

  return null;
};

const defaultStudent = {
  student_id: "guest_student",
  name: "Guest Student"
};

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(loadStoredStudent || defaultStudent);

  const login = (studentData, tokens = {}) => {
    const normalizedStudent = normalizeStudent(studentData);

    if (!normalizedStudent?.student_id) {
      throw new Error("Invalid student data. student_id is required.");
    }

    for (const key of STUDENT_STORAGE_KEYS) {
      localStorage.setItem(key, JSON.stringify(normalizedStudent));
    }

    if (tokens.accessToken) localStorage.setItem("token", tokens.accessToken);
    if (tokens.refreshToken) localStorage.setItem("refreshToken", tokens.refreshToken);

    setStudent(normalizedStudent);
  };

  const logout = () => {
    for (const key of STUDENT_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setStudent(defaultStudent);
  };

  const isAuthenticated = true;

  return (
    <AuthContext.Provider value={{ student, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
