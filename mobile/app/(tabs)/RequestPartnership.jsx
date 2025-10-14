import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { listMyProjects } from "../../lib/projects";
import { getToken } from "../../lib/auth";
import { API_BASE_URL } from "../../lib/api";

export default function RequestPartnership() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchProjects() {
      try {
            const projects = await listMyProjects();
            setProjects(projects || []);
          } catch (err) {
            setError("Failed to load projects");
          } finally {
            setLoading(false);
          }
    }
    fetchProjects();
  }, []);

  const handleSendRequest = async () => {
    if (!selectedProject) return;
    if (!params.id) {
      setError("Partner ID is missing.");
      setSending(false);
      return;
    }
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const token = await getToken();
      console.log('Current token:', token);
      if (!token) throw new Error("No authentication token found");
      const response = await fetch(`${API_BASE_URL}/partners/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          partnerId: params.id,
          partnerType: params.type,
          projectId: selectedProject._id,
        }),
      });
      if (!response.ok) throw new Error("Request failed");
      setSuccess("Request sent successfully!");
      router.push("/(tabs)/Partners");
    } catch (err) {
      let errorMsg = "Failed to send request";
      if (err.response) {
        // If using axios, err.response.data; for fetch, try to parse response
        errorMsg += ": " + JSON.stringify(err.response.data || err.response.statusText);
      } else if (err.message) {
        errorMsg += ": " + err.message;
      }
      console.log('Request error:', err);
      setError(errorMsg);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request Partnership</Text>
      <Text style={styles.subtitle}>Select your project to send a partnership request to {params.name}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#16a34a" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.projectCard, selectedProject?._id === item._id && styles.selectedCard]}
              onPress={() => setSelectedProject(item)}
            >
              <Text style={styles.projectName}>{item.name}</Text>
              <Text style={styles.projectDesc}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity
        style={[styles.sendBtn, !selectedProject && { opacity: 0.5 }]}
        disabled={!selectedProject || sending}
        onPress={handleSendRequest}
      >
        <Text style={styles.sendText}>{sending ? "Sending..." : "Send Request"}</Text>
      </TouchableOpacity>
      {success ? <Text style={styles.success}>{success}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#16a34a", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#555", marginBottom: 16 },
  error: { color: "red", marginBottom: 8 },
  success: { color: "#16a34a", marginTop: 8 },
  projectCard: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: "#e5e7eb" },
  selectedCard: { borderColor: "#16a34a", borderWidth: 2 },
  projectName: { fontSize: 16, fontWeight: "bold", color: "#222" },
  projectDesc: { fontSize: 13, color: "#555" },
  sendBtn: { backgroundColor: "#16a34a", borderRadius: 8, padding: 12, alignItems: "center", marginTop: 16 },
  sendText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
