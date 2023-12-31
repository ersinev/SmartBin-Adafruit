import React, { useEffect, useState } from "react";
import Chart from "./Chart";
import WeightData from "./WeightData";
import GarbageAnimation from "./GarbageAnimation";

function HiddenSection({
  section,
  index,
  fetchChartData,
  toggleChart,
  handleWeightChange,
  fetchingData,
  setHiddenSections,
  hiddenSectionsRef
})

{
  const percentage= ((section.weight / section.data.capacity) * 100).toFixed(2)
  const [isHidden, setisHidden] = useState(true)
  useEffect(() => {
    if(percentage>80){
      setisHidden(false)
    }
  }, [percentage])
  
  return (
    <div key={index} className="hidden-section">
      <div className="section-header">
        <div className="section-header-school">
          <span>{section.data.schoolName}</span>
        </div>
        <div className="section-header-class">{section.data.className}</div>
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
      <WeightData
        
        onWeightChange={(newWeight) => handleWeightChange(index, newWeight)}
        adafruitUsername={section.data.adafruitUsername}
        feedKey={section.data.feedKey}
        adafruitIoKey={section.data.adafruitIoKey}
        fetchingData={fetchingData}
      />
      <div
        className={`chart-container ${
          section.showChart ? "visible" : "hidden"
        }`}
      >
        <Chart
          data={section.chartData}
          capacity={section.data.capacity}
          style={{ width: "100%", height: "100%" }}
        />
        {!section.showChart && section.chartData.length > 0 && (
          <div className="latest-chart-value">
            Latest Value: {section.chartData[0].value}
          </div>
        )}
      </div>
      {section.showChart ? (
        <></>
      ) : (
        <>
          <GarbageAnimation
            fillPercentage={(section.weight / section.data.capacity) * 100}
          />
          <p ref={hiddenSectionsRef}> 
            Garbage Fill Percentage:{" "}<span style={{fontSize:"larger", fontWeight:"bolder"}} className="fillPercentage">
            {percentage}%</span>
          <p style={{color:"red"}} hidden={isHidden}><span style={{fontWeight:"bolder"}}>WARNING!!!</span> Please empty the trash.</p>
          </p>

        </>
      )}
    </div>
  );
}

export default HiddenSection;
