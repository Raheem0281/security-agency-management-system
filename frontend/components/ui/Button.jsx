export function Button({ children, variant = "primary", ...props }) {
  const styles = {
    primary: "bg-blue-500 text-white",
    danger: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-white",
    success: "bg-green-500 text-white",
    gray: "bg-gray-400 text-white",
  };

  return (
    <button
      className={`px-3 py-2 rounded ${styles[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
}