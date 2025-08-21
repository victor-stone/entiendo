import { useEffect } from "react";
import { useUserStore, useReportsStore } from "../stores";
import { LoadingIndicator } from "../components/ui";
import { Card } from "../components/layout";
import Glyph from "../components/ui/Glyph";

const reportContainer = "max-w-3xl mx-auto my-16 px-6";
const cardSection = "mb-14 p-10 bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-3xl shadow-2xl flex flex-col gap-8 border border-blue-100";
const sectionTitle = "text-3xl font-extrabold mb-8 text-blue-900 tracking-tight border-b-4 border-blue-200 pb-3 drop-shadow-sm";
const insightsList = "mt-0 space-y-8";
const insightItem = "flex flex-col gap-2";
const insightPattern = "text-2xl font-bold text-blue-800 mb-1 leading-tight tracking-wide";
const insightDescription = "text-lg text-gray-800 mb-0 leading-relaxed";
const insightSuggestion = "italic text-green-700 text-base leading-snug mt-1 max-w-xl ml-6 flex items-start gap-2";
const tipsList = "mt-0 space-y-4";
const tipItem = "pl-7 border-l-4 border-blue-400 text-gray-900 bg-blue-50 py-4 rounded-r-2xl shadow text-lg leading-relaxed font-medium";


function Reports() {

    const { getToken, user } = useUserStore();    
    const { data, fetch, error, loading } = useReportsStore();

    useEffect(() => {
        if (!data && !loading && !error) {
          fetch(getToken);
        }
      }, [data, getToken, fetch, error, loading]);
    
      if (error ) {
        return <p className="text-red-500">{error}</p>;
      }
    
      if (loading || !data ) {
        return <LoadingIndicator message="Generating reports - this might take a moment." />
      }

      const report = data[0];

      return (
        <div className={reportContainer}>
          <Card title="Reports">
            <Card.Body>
              {/* Insights Section */}
              <div className={cardSection}>
                <div className={sectionTitle}>Insights</div>
                <ul className={insightsList}>
                  {report.insights.map((insight, idx) => (
                    <li key={idx} className={insightItem}>
                      <div className={insightPattern}>{insight.pattern}</div>
                      <div className={insightDescription}>{insight.description}</div>
                      <div className={insightSuggestion}>
                        <Glyph name="LightBulbIcon" className="mt-0" />
                        <span>{insight.suggestion}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Strategy Tips Section */}
              <div className={cardSection}>
                <div className={sectionTitle}>Strategy Tips</div>
                <ul className={tipsList}>
                  {report.strategyTips.map((tip, idx) => (
                    <li key={idx} className={tipItem}>{tip}</li>
                  ))}
                </ul>
              </div>
            </Card.Body>
          </Card>
        </div>
      )
}

export default Reports;