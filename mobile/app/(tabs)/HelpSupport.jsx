import React from "react";
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function HelpSupport() {
	const router = useRouter();
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
			<Text style={{ fontSize: 18, marginBottom: 20 }}>
				Support Page Currently Not Available.
			</Text>
			<Button title="Go Back" onPress={() => router.back()} />
		</View>
	);
}
