import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import SearchBar from "./SearchBar";
import DataTable from "./DataTable";
import InputFields from "./InputFields";
import HiddenSection from "./HiddenSection";
import Compare from "./Compare";

function App() {
  const [adafruitUsername, setAdafruitUsername] = useState("");
  const [feedKey, setFeedKey] = useState("");
  const [adafruitIoKey, setAdafruitIoKey] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [className, setClassName] = useState("");
  const [capacity, setCapacity] = useState(1000);
  const [fetchingData, setFetchingData] = useState(false);
  const [savedData, setSavedData] = useState([]);
  const [hiddenSections, setHiddenSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const hiddenSectionsRef = useRef(null);

  useEffect(() => {
    const storedData = localStorage.getItem("savedData");
    if (storedData) {
      setSavedData(JSON.parse(storedData));
    }
  }, []);

  const handleWeightChange = (dataIndex, newWeight) => {
    setHiddenSections((prevHiddenSections) =>
      prevHiddenSections.map((section, index) =>
        index === dataIndex ? { ...section, weight: newWeight } : section
      )
    );
  };

  const handleCapacityChange = (index, newCapacity) => {
    setSavedData((prevSavedData) =>
      prevSavedData.map((data, dataIndex) =>
        dataIndex === index ? { ...data, capacity: newCapacity } : data
      )
    );
  };

  const fetchChartData = async (section, index) => {
    try {
      const response = await fetch(
        `https://io.adafruit.com/api/v2/${section.data.adafruitUsername}/feeds/${section.data.feedKey}/data`,
        {
          headers: {
            "X-AIO-Key": section.data.adafruitIoKey,
          },
        }
      );
      const chartData = await response.json();

      if (chartData.length > 0) {
        const latestData = chartData[0]; // Get the latest chart data point
        console.log(chartData);
        setHiddenSections((prevHiddenSections) =>
          prevHiddenSections.map((s, i) =>
            i === index ? { ...s, chartData, latestData, showChart: true } : s
          )
        );
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const toggleChart = (index) => {
    setHiddenSections((prevHiddenSections) =>
      prevHiddenSections.map((section, i) =>
        i === index ? { ...section, showChart: !section.showChart } : section
      )
    );
  };

  const startFetching = async (data) => {
    setFetchingData(true);
    setSchoolName(data.schoolName);
    setClassName(data.className);
    setAdafruitUsername(data.adafruitUsername);
    setFeedKey(data.feedKey);
    setAdafruitIoKey(data.adafruitIoKey);
    setCapacity(data.capacity);
    setHiddenSections((prevHiddenSections) => [
      ...prevHiddenSections,
      { data: { ...data }, weight: 0, showChart: false, chartData: [] },
    ]);
    if (hiddenSectionsRef.current) {
      hiddenSectionsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const saveData = () => {
    const newData = {
      schoolName,
      className,
      adafruitUsername,
      feedKey,
      adafruitIoKey,
      capacity,
    };
    const updatedSavedData = [...savedData, newData];

    setSavedData(updatedSavedData);
    setSchoolName("");
    setClassName("");
    setAdafruitUsername("");
    setFeedKey("");
    setAdafruitIoKey("");
    setCapacity(1000);

    localStorage.setItem("savedData", JSON.stringify(updatedSavedData));
  };

  const deleteSavedData = (index) => {
    const newSavedData = savedData.filter((_, i) => i !== index);
    setSavedData(newSavedData);

    setHiddenSections((prevHiddenSections) =>
      prevHiddenSections.filter((_, i) => i !== index)
    );

    localStorage.setItem("savedData", JSON.stringify(newSavedData));
  };

  const renderCapacityInput = (data, index) => {
    return (
      <input
        type="number"
        value={data.capacity}
        onChange={(e) => handleCapacityChange(index, Number(e.target.value))}
      />
    );
  };

  return (
    <Container
      fluid
      className="justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <div className="text-center my-4">
        <img
          src={require("./garbage3.png")}
          alt="Garbage"
          style={{
            maxWidth: "100%",
            height: "200px",
            borderRadius: "40px",
            transform: "rotate(-10deg)",
          }}
        />
        <img
          src={require("./logo.png")}
          alt="Logo"
          style={{ maxWidth: "100%", height: "auto" }}
        />
        <img
          src={require("./garbage3.png")}
          alt="Garbage"
          style={{
            maxWidth: "100%",
            height: "200px",
            borderRadius: "40px",
            transform: "rotate(10deg)",
          }}
        />
      </div>

      <div className="app">
        <h1>Smart Bin Project</h1>
        <InputFields
          schoolName={schoolName}
          className={className}
          adafruitUsername={adafruitUsername}
          feedKey={feedKey}
          adafruitIoKey={adafruitIoKey}
          capacity={capacity}
          setSchoolName={setSchoolName}
          setClassName={setClassName}
          setAdafruitUsername={setAdafruitUsername}
          setFeedKey={setFeedKey}
          setAdafruitIoKey={setAdafruitIoKey}
          setCapacity={setCapacity}
          saveData={saveData}
        />

        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        <Container fluid>
          <DataTable
            savedData={savedData}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            startFetching={startFetching}
            renderCapacityInput={renderCapacityInput}
            deleteSavedData={deleteSavedData}
            compareButton={<Compare savedData={savedData} />}
          />
        </Container>

        <div className="hidden-sections-container">
          {hiddenSections.map((section, index) => (
            <HiddenSection
              hiddenSectionsRef={hiddenSectionsRef}
              key={index}
              section={section}
              index={index}
              fetchChartData={fetchChartData}
              toggleChart={toggleChart}
              handleWeightChange={handleWeightChange}
              fetchingData={fetchingData}
              setHiddenSections={setHiddenSections}
            />
          ))}
        </div>
      </div>
    </Container>
  );
}

export default App;
