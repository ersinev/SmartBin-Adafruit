import React, { useEffect, useState } from "react";
import "./App.css";
import GarbageAnimation from "./GarbageAnimation";
import Chart from "./Chart";
import WeightData from "./WeightData";
import { Container } from "react-bootstrap";

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

      setHiddenSections((prevHiddenSections) =>
        prevHiddenSections.map((s, i) =>
          i === index ? { ...s, chartData, showChart: true } : s
        )
      );
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
    setHiddenSections((prevHiddenSections) => [
      ...prevHiddenSections,
      { data: { ...data }, weight: 0, showChart: false, chartData: [] },
    ]);
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
    <Container fluid>
      <img src={require("./logo.png")} alt="Logo" />
      <div className="app">
        <h1>Garbage Animations</h1>
        <div className="input-table">
          <div className="input-row">
            <div className="input-cell">
              <label>School Name</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>
            <div className="input-cell">
              <label>Class Name</label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>
            <div className="input-cell">
              <label>Adafruit Username</label>
              <input
                type="text"
                value={adafruitUsername}
                onChange={(e) => setAdafruitUsername(e.target.value)}
              />
            </div>
            <div className="input-cell">
              <label>Feed Key</label>
              <input
                type="text"
                value={feedKey}
                onChange={(e) => setFeedKey(e.target.value)}
              />
            </div>
            <div className="input-cell">
              <label>Adafruit IO Key</label>
              <input
                type="text"
                value={adafruitIoKey}
                onChange={(e) => setAdafruitIoKey(e.target.value)}
              />
            </div>
            <div className="input-cell">
            <label>Capacity</label>
              {renderCapacityInput(
                savedData /* provide the correct index here */
              )}
            </div>
            <div className="input-cell">
              <button onClick={saveData}>Save</button>
            </div>
          </div>
        </div>

        <h2>Saved Data</h2>
        <Container fluid>
          <div className="data-table">
            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>School Name</th>
                  <th>Class Name</th>
                  <th>Adafruit Username</th>
                  <th>Feed Key</th>
                  <th>Adafruit IO Key</th>
                  <th>Capacity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedData.map((data, index) => (
                  <tr key={index}>
                    <td>{data.schoolName}</td>
                    <td>{data.className}</td>
                    <td>{data.adafruitUsername}</td>
                    <td>{data.feedKey}</td>
                    <td>{data.adafruitIoKey}</td>
                    <td>{renderCapacityInput(data, index)}</td>
                    <td>
                      <button onClick={() => startFetching(data)}>
                        Start Fetching
                      </button>
                      <button onClick={() => deleteSavedData(index)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>

        <div className="hidden-sections-container">
          {hiddenSections.map((section, index) => (
            <div key={index} className="hidden-section">
              <div className="section-header">
                <div className="section-header-school">
                  <span>{section.data.schoolName}</span>
                </div>
                <div className="section-header-class">
                  {section.data.className}
                </div>
                <div className="section-header-buttons">
                  <button
                    className="chart-button"
                    onClick={() => {
                      if (!section.showChart) {
                        fetchChartData(section, index);
                      } else {
                        toggleChart(index);
                      }
                    }}
                  >
                    {section.showChart ? "Bin" : "Chart"}
                  </button>
                  <button
                    className="close-button"
                    onClick={() =>
                      setHiddenSections((prevHiddenSections) =>
                        prevHiddenSections.filter((_, i) => i !== index)
                      )
                    }
                  >
                    X
                  </button>
                </div>
              </div>
              {section.showChart ? (
                <Chart
                  data={section.chartData}
                  style={{ width: "100%", height: "300px" }}
                />
              ) : (
                <>
                  <WeightData
                    onWeightChange={(newWeight) =>
                      handleWeightChange(index, newWeight)
                    }
                    adafruitUsername={section.data.adafruitUsername}
                    feedKey={section.data.feedKey}
                    adafruitIoKey={section.data.adafruitIoKey}
                    fetchingData={fetchingData}
                  />
                  <GarbageAnimation
                    fillPercentage={
                      (section.weight / section.data.capacity) * 100
                    }
                  />
                  <p>
                    Garbage Fill Percentage:{" "}
                    {((section.weight / section.data.capacity) * 100).toFixed(
                      2
                    )}
                    %
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}

export default App;
