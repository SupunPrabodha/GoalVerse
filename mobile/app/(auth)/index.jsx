import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  Pressable,
  ActivityIndicator,              
  Alert,                          
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// 🆕 add these imports
import { signup as apiSignup, login as apiLogin } from "../../lib/auth";

const ROLES = ["NGO Manager", "Donor", "Volunteer"];

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  // login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // signup state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("NGO Manager");
  const [rolePickerOpen, setRolePickerOpen] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  // 🆕 ui state
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const router = useRouter();

  const canSubmitSignup =
    fullName.trim() &&
    email.trim() &&
    password.length >= 6 &&
    password === confirmPassword;

  // 🆕 UI role -> backend enum
  const mapRoleToEnum = (r) => {
    if (r === "NGO Manager") return "NGO_MANAGER";
    if (r === "Volunteer") return "VOLUNTEER";
    return "DONOR";
  };

  // 🆕 handlers
  const handleLogin = async () => {
    try {
      setLoading(true);
      setErr("");
      const user = await apiLogin({ email: loginEmail.trim(), password: loginPassword });
      // If NGO Manager and not completed profile, route to setup
      // if (user.role === "NGO_MANAGER" && !user.isOrgProfileComplete) {
      //   router.replace("/(setup)/OrgProfileSetup");
      // } else {
      //   router.replace("/(tabs)/HomeScreen");
      // }

      if (user.role === "NGO_MANAGER") {
        if (!user.isOrgProfileComplete) {
          router.replace("/(setup)/OrgProfileSetup");
        } else {
          router.replace("/(tabs)/NGOManagerHome"); // ✅ go to dashboard
        }
      } else {
        router.replace("/(tabs)/HomeScreen");
      }

    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    try {
      setLoading(true);
      setErr("");
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role: mapRoleToEnum(role),
        // organizationName: ""   // add if you collect it on this form
      };
      const user = await apiSignup(payload);
      if (user.role === "NGO_MANAGER") {
        router.replace("/(setup)/OrgProfileSetup");
      } else {
        router.replace("/(tabs)/HomeScreen");
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Signup failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111827" }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo + Title */}
        <Image source={require("../../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>GoalBridge</Text>
        <Text style={styles.subtitle}>Advancing transparency in sustainable finance</Text>

        {/* 🆕 error banner */}
        {!!err && <Text style={styles.errorText}>{err}</Text>}

        {/* Card */}
        <View style={styles.card}>
          {/* Toggle Buttons */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, isLogin && styles.activeBtn]}
              onPress={() => { setIsLogin(true); setErr(""); }}
            >
              <Text style={[styles.toggleText, isLogin && styles.activeText]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, !isLogin && styles.activeBtn]}
              onPress={() => { setIsLogin(false); setErr(""); }}
            >
              <Text style={[styles.toggleText, !isLogin && styles.activeText]}>Signup</Text>
            </TouchableOpacity>
          </View>

          {/* LOGIN */}
          {isLogin ? (
            <View>
              <Label text="Email Address" />
              <InputWithIcon
                icon="mail-outline"
                placeholder="Enter your email"
                value={loginEmail}
                onChangeText={setLoginEmail}
                keyboardType="email-address"
                autoCapitalize="none"            // 🆕
              />
              <Label text="Password" />
              <InputWithIcon
                icon="lock-closed-outline"
                placeholder="Enter your password"
                value={loginPassword}
                onChangeText={setLoginPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
                onPress={handleLogin}              // 🆕
                disabled={loading}                 // 🆕
              >
                {loading ? (
                  <ActivityIndicator color="#fff" /> // 🆕
                ) : (
                  <Text style={styles.primaryBtnText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            // SIGNUP
            <View>
              <Label text="Full Name" />
              <InputWithIcon
                icon="person-outline"
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
              />

              <Label text="Email Address" />
              <InputWithIcon
                icon="mail-outline"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"            // 🆕
              />

              <Label text="Password" />
              <InputWithIcon
                icon="lock-closed-outline"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                rightIcon={showPw ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setShowPw((s) => !s)}
              />

              <Label text="Confirm Password" />
              <InputWithIcon
                icon="lock-closed-outline"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPw2}
                rightIcon={showPw2 ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setShowPw2((s) => !s)}
              />

              <Label text="Role" />
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setRolePickerOpen(true)}
                activeOpacity={0.8}
              >
                <Text style={{ color: "#222" }}>{role}</Text>
                <Ionicons name="chevron-down" size={18} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryBtn, (!canSubmitSignup || loading) && { opacity: 0.6 }]}
                disabled={!canSubmitSignup || loading}
                onPress={handleSignup}            // 🆕
              >
                {loading ? (
                  <ActivityIndicator color="#fff" /> // 🆕
                ) : (
                  <Text style={styles.primaryBtnText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.footerText}>
                Already have an account?{" "}
                <Text style={styles.link} onPress={() => setIsLogin(true)}>
                  Login
                </Text>
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Role Picker Modal */}
      <Modal transparent visible={rolePickerOpen} animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setRolePickerOpen(false)}>
          <View style={styles.modalSheet}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r}
                style={styles.modalItem}
                onPress={() => {
                  setRole(r);
                  setRolePickerOpen(false);
                }}
              >
                <Text style={{ fontSize: 16 }}>{r}</Text>
                {role === r && <Ionicons name="checkmark" size={18} color="#4CAF50" />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- Small UI helpers ---------- */
function Label({ text }) {
  return <Text style={styles.label}>{text}</Text>;
}
function InputWithIcon({
  icon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}) {
  return (
    <View style={[styles.inputRow, style]}>
      <Ionicons name={icon} size={18} color="#889096" />
      <TextInput style={styles.inputFlex} placeholderTextColor="#98A2B3" {...props} />
      {rightIcon && (
        <TouchableOpacity onPress={onRightIconPress}>
          <Ionicons name={rightIcon} size={18} color="#667085" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// …your existing StyleSheet below…
// /* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center" },
  logo: { width: 80, height: 80, marginTop: 20 },
  title: { fontSize: 30, fontWeight: "bold", color: "white", marginTop: 10, textAlign: "center" },
  subtitle: { color: "#b4b4b4ff",fontSize: 17,marginTop: 10, textAlign: "center", marginBottom: 20 },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 30
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#162341ff",
    borderRadius: 8,
    marginBottom: 20,
    padding: 6,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  activeBtn: { backgroundColor: "#fff", borderRadius: 8, elevation: 1 },
  toggleText: { color: "#ffffffff",fontSize: 15, fontWeight: "600" },
  activeText: { color: "#000" },

  /* Inputs */
  label: { fontSize: 14,fontWeight: "bold", color: "#616161ff", marginBottom: 6, marginTop: 10 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputFlex: { flex: 1, paddingVertical: 0, color: "#111" },

  /* Dropdown */
  dropdown: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  /* Upload */
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 4,
    gap: 8,
  },
  uploadText: { color: "#4CAF50", fontWeight: "600" },

  /* SDGs */
  sdgsWrap: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: 6 },
  sdgChip: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center", alignItems: "center",
    margin: 4, borderWidth: 1, borderColor: "#E5E7EB",
  },
  sdgChipActive: { backgroundColor: "#18A558", borderColor: "#18A558" },
  sdgChipText: { fontWeight: "600", color: "#111" },
  sdgChipTextActive: { color: "#fff" },

  /* Buttons */
  primaryBtn: {
    backgroundColor: "#16a34a",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  primaryBtnText: { color: "#fff", fontWeight: "600" },

  footerText: { textAlign: "center", marginTop: 14, color: "#666" },

  /* Modal */
  modalBackdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff", padding: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  modalItem: {
    paddingVertical: 14, paddingHorizontal: 6, flexDirection: "row",
    justifyContent: "space-between", alignItems: "center",
    borderBottomWidth: 1, borderColor: "#F2F4F7",
  },
  errorText: {
  backgroundColor: "#fde8e8",
  color: "#b91c1c",
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 8,
  marginBottom: 8,
},

});