import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(() => {
    try {
      const savedStudent = localStorage.getItem("student");
      return savedStudent ? JSON.parse(savedStudent) : null;
    } catch (e) {
      console.error("Failed to parse student data from localStorage:", e);
      return null;
    }
  });

  const login = (studentData) => {
    if (!studentData || !studentData.student_id) {
      throw new Error("Invalid student data. student_id is required.");
    }
    // Save to localStorage and update state
    localStorage.setItem("student", JSON.stringify(studentData));
    setStudent(studentData);
  };

  const logout = () => {
    // Clear localStorage and reset state
    localStorage.removeItem("student");
    setStudent(null);
  };

  const isAuthenticated = !!(student && student.student_id);

  return (
    <AuthContext.Provider value={{ student, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
