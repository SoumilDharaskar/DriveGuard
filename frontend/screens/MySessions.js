import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { MainContext } from "../context/MainContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import LoadingIndicator from "../components/loadingIndicator/loadingIndicator";
import SessionCard from "../components/card/session-card";
import { useIsFocused } from "@react-navigation/native";

const MySessions = ({ navigation }) => {
  const context = useContext(MainContext);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const isFocused = useIsFocused();

  const getToken = async () => {
    try {
      return await AsyncStorage.getItem("auth_token");
    } catch (e) {
      console.log(e);
    }
  };

  const getSessions = async () => {
    try {
      const token = await getToken();
      const response = await fetch(context.fetchPath + `api/getSessions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-tokens": token,
        },
      });
      const json = await response.json();

      if (json.message) {
        Toast.show({
          text1: "Error",
          text2: json.message,
          type: "error",
        });
      } else {
        setSessions(
          json.sessionData
            .map((item) => {
              return {
                ...item,
                startDate: new Date(item.startDate),
                endDate: new Date(item.endDate),
              };
            })
            .sort((a, b) => {
              // Put whatevers active at the top first
              if (a.status == "ACTIVE" && b.status != "ACTIVE") return 1;
              if (a.status != "ACTIVE" && b.status == "ACTIVE") return -1;
              // Sort in descending order from latest to oldest
              if (a.status == "ACTIVE" && b.status == "ACTIVE")
                return a.startDate - b.startDate;
              return a.endDate - b.endDate;
            })
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      getSessions();
    }
  }, [isFocused]);

  //Display the duration in hours and mins -> output is array [hours, mins]
  const getTimeDuration = (startDate, endDate) => {
    const totalMin =
      Math.abs(startDate.getTime() - endDate.getTime()) / (1000 * 60);

    const hours = totalMin / 60;
    const roundHours = Math.floor(hours);
    const minutes = (hours - roundHours) * 60;
    const roundMinutes = Math.round(minutes);
    return [roundHours, roundMinutes];
  };

  return (
    <View
      style={[styles.container, { backgroundColor: context.screenBackground }]}
    >
      <View style={styles.upperContainer}>
        <View style={styles.textWrapper}>
          <Text
            style={[styles.headerTitle, { color: context.secondaryColour }]}
          >
            My Trips
          </Text>
        </View>
      </View>
      {isLoading ? (
        <LoadingIndicator isAnimating={true} />
      ) : (
        <View style={styles.flatListContainer}>
          <FlatList
            data={sessions.reverse()}
            renderItem={({ item }) => {
              return (
                <>
                  <SessionCard
                    imageUrl={item.image_url}
                    startDate={item.startDate}
                    duration={
                      item.status == "COMPLETED"
                        ? getTimeDuration(item.startDate, item.endDate)
                        : []
                    }
                    status={item.status}
                    numOfIncidents={item.numOfIncidents}
                    onPress={() =>
                      navigation.navigate("SessionDetails", {
                        session: item,
                      })
                    }
                  />
                  <View style={{ height: 20 }} />
                </>
              );
            }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  upperContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
  },
  textWrapper: {
    width: "85%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "600",
  },
  flatListContainer: {
    flex: 1,
    width: "85%",
    justifyContent: "space-around",
    alignSelf: "center",
  },
});

export default MySessions;
