import React from "react";

interface ErrorMessageProps {
  message: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
      {message}
    </div>
  );
};

export default ErrorMessage;