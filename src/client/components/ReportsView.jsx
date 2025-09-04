import Glyph from "./ui/Glyph";
import { LoadingIndicator } from "./ui";
import { Card } from "./layout";
import * as ReportStates from "../../shared/constants/reportStates.js";

const reportContainer = "max-w-3xl mx-auto my-16 px-6";
const cardSection =
  "mb-14 p-10 bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-3xl shadow-2xl flex flex-col gap-8 border border-blue-100";
const sectionTitle =
  "text-3xl font-extrabold mb-8 text-blue-900 tracking-tight border-b-4 border-blue-200 pb-3 drop-shadow-sm";
const insightsList = "mt-0 space-y-8";
const insightItem = "flex flex-col gap-2";
const insightPattern =
  "text-2xl font-bold text-blue-800 mb-1 leading-tight tracking-wide";
const insightDescription = "text-lg text-gray-800 mb-0 leading-relaxed";
const insightSuggestion =
  "italic text-green-700 text-base leading-snug mt-1 max-w-xl ml-6 flex items-start gap-2";
const tipsList = "mt-0 space-y-4";
const tipItem =
  "pl-7 border-l-4 border-blue-400 text-gray-900 bg-blue-50 py-4 rounded-r-2xl shadow text-lg leading-relaxed font-medium";

const DoReportsTitle = ({ title = "Reports", reports = [], onHistory }) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="text-left">{title}</div>
      <div className="text-right">
        {reports.length > 1 && (
          <button onClick={onHistory} className="btn btn-primary">
            History
          </button>
        )}
      </div>
    </div>
  );
};

function ReportsView({ data, loading, error, onGenerate }) {
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (loading || !data) {
    return (
      <LoadingIndicator message="Generating reports - this might take a moment." />
    );
  }

  const report = data.reports[0];
  const state = data.state;

  return (
    <div className={reportContainer}>
      <Card title={<DoReportsTitle reports={data.reports} onGenerate={onGenerate} />}>
        <Card.Body>
          {state == ReportStates.RS_GEN_NEW_AVAIL && (
            <div className={cardSection}>
              A new report based on recent exercises is available.
              <button className="btn btn-primary" onClick={onGenerate}>
                Generate a new report
              </button>
            </div>
          )}

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
                <li key={idx} className={tipItem}>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default ReportsView;

