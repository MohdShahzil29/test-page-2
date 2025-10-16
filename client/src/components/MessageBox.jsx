export default function MessageBox({ message, messageVisible, COLORS }) {
  return (
    <div
      id="messageBox"
      className={messageVisible ? "show" : ""}
      style={{ zIndex: 200 }}
    >
      {message}
    </div>
  );
}
