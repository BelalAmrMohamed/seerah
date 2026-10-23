import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

/** true unless the device is known to be offline. */
export function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) => setOnline(s.isConnected !== false && s.isInternetReachable !== false));
    return unsub;
  }, []);
  return online;
}
