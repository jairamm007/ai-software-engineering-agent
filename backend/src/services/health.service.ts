export const getHealthStatus = () => {
  return {
    success: true,
    message: "Backend is running successfully",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  };
};