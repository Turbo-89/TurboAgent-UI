export default function MicIcon({ active }: { active: boolean }) {
  return (
    <div
      style={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: active ? "#dc2626" : "#444",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "0.2s",
      }}
    >
      <div
        style={{
          width: 10,
          height: 14,
          background: "white",
          borderRadius: "4px",
        }}
      ></div>
    </div>
  );
}
