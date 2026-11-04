"use client";

import { Popover } from "@/components/ui/Popover";
import { useAuth } from "./AuthProvider";
import styles from "./Auth.module.css";

/** Header control: "Sign in", or your avatar with a sign-out menu. Hidden until sign-in is set up. */
export function AccountButton() {
  const { status, user, signIn, signOut } = useAuth();
  if (status === "disabled" || status === "loading") return null;
  if (status !== "signed-in" || !user) {
    return (
      <button type="button" className={styles.signIn} onClick={signIn}>
        Sign in
      </button>
    );
  }
  const initial = user.name.charAt(0).toUpperCase();
  return (
    <Popover
      label={`Account: ${user.name}`}
      align="end"
      triggerClassName={styles.avatarButton}
      trigger={
        <span className={styles.avatar}>
          {user.picture ? (
            // eslint-disable-next-line @next/next/no-img-element -- Google profile photo
            <img src={user.picture} alt="" width={28} height={28} referrerPolicy="no-referrer" />
          ) : (
            initial
          )}
        </span>
      }
    >
      <div className={styles.menu}>
        <p className={styles.menuName}>{user.name}</p>
        <p className={styles.menuEmail}>{user.email}</p>
        <button type="button" data-dismiss className={styles.menuAction} onClick={() => void signOut()}>
          Sign out
        </button>
      </div>
    </Popover>
  );
}
