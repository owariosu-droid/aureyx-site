"use client";
import { useEffect, useState } from "react";

export default function MicrophoneInput({ value, onChange, active }: { value: string; onChange: (id: string) => void; active: boolean }) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    let disposed = false;
    const update = async () => {
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        if (!disposed) setDevices(list.filter(device => device.kind === "audioinput" && device.deviceId && device.deviceId !== "default"));
      } catch { /* System default remains usable if device enumeration is restricted. */ }
    };
    void update();
    navigator.mediaDevices.addEventListener("devicechange", update);
    return () => { disposed = true; navigator.mediaDevices.removeEventListener("devicechange", update); };
  }, [active]);
  return <label className="audio-microphone-select">Microphone<select value={value} onChange={event => onChange(event.target.value)} disabled={active}><option value="">System default</option>{devices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || "Microphone " + (index + 1)}</option>)}</select></label>;
}
