"use client";
export function GoProButton() {
  const onClick = async () => {
    const r = await fetch("/api/checkout", { method: "POST" });
    const { url } = await r.json();
    window.location.href = url;
  };
  return <button onClick={onClick} className="px-4 py-2 rounded bg-black text-white">Go Pro</button>;
}
