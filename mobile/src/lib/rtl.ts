import { DevSettings, I18nManager } from "react-native";
import * as Updates from "expo-updates";

/**
 * Full RTL. On the very first launch Android still has LTR cached, so we force RTL and
 * reload once; afterwards `I18nManager.isRTL` is true from the first frame.
 * Returns true when the layout is already RTL.
 */
export function ensureRTL(): boolean {
  if (I18nManager.isRTL) return true;
  I18nManager.allowRTL(true);
  I18nManager.swapLeftAndRightInRTL(true);
  I18nManager.forceRTL(true);
  Updates.reloadAsync().catch(() => {
    try { DevSettings.reload(); } catch { /* user restarts manually — see RestartNotice */ }
  });
  return false;
}
