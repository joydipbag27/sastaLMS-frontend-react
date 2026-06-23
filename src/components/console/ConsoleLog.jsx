import React, { useState, useEffect, useRef } from "react";

const ConsoleLog = ({ logs, onClear }) => {
  const [selectedLog, setSelectedLog] = useState(null);
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <section className="w-full md:w-96 bg-slate-950 p-4 flex flex-col border-t md:border-t-0 md:border-l border-slate-800 overflow-hidden h-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">API Activity Feed</h2>
        </div>
        {logs.length > 0 && (
          <button
            onClick={() => {
              onClear();
              setSelectedLog(null);
            }}
            className="text-[10px] bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded border border-slate-800 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Logs feed */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[150px] max-h-[400px] md:max-h-none">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-28 text-center text-slate-600 text-xs italic">
            <span>No requests logged.</span>
            <span className="text-[10px] text-slate-700 mt-1">Interact with forms to trigger API calls</span>
          </div>
        ) : (
          logs.map((log, index) => {
            const isSelected = selectedLog === log;
            return (
              <div
                key={index}
                onClick={() => setSelectedLog(log)}
                className={`p-2 rounded cursor-pointer border text-[11px] hover:border-slate-700 transition-all ${
                  log.success
                    ? "bg-slate-900/60 border-slate-850/80"
                    : "bg-rose-950/10 border-rose-900/30 text-rose-200"
                } ${isSelected ? "ring-1 ring-sky-500 border-transparent bg-slate-900" : ""}`}
              >
                <div className="flex justify-between items-center gap-1.5 font-bold mb-1">
                  <span className={log.success ? "text-emerald-400" : "text-rose-400"}>
                    [{log.status}] {log.method}
                  </span>
                  <span className="text-slate-600 font-normal text-[9px]">{log.timestamp}</span>
                </div>
                <div className="text-slate-400 truncate text-[10px] font-mono">{log.url}</div>
                <div className="text-[9px] text-slate-500 text-right mt-1 font-mono">duration: {log.duration}</div>
              </div>
            );
          })
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Expanded Log detail popup/drawer */}
      {selectedLog && (
        <div className="border-t border-slate-800 pt-3 mt-3 bg-slate-950 text-[10px] space-y-2 max-h-80 overflow-y-auto font-mono scrollbar-thin">
          <div className="flex items-center justify-between font-bold border-b border-slate-900 pb-1 mb-1">
            <span className="text-sky-400 text-xs">Request Details</span>
            <button
              onClick={() => setSelectedLog(null)}
              className="text-rose-400 font-bold hover:text-rose-300 transition-colors"
            >
              [Close]
            </button>
          </div>

          <div>
            <span className="text-slate-500 block">Endpoint:</span>
            <span className={`font-bold ${selectedLog.success ? "text-emerald-400" : "text-rose-400"}`}>
              {selectedLog.method}
            </span>{" "}
            <span className="text-slate-300 break-all">{selectedLog.url}</span>
          </div>

          {selectedLog.body && (
            <div>
              <span className="text-slate-500 block">Payload sent:</span>
              <pre className="bg-slate-900 p-2 rounded border border-slate-850 text-slate-300 overflow-x-auto text-[9px] max-h-24">
                {typeof selectedLog.body === "string"
                  ? selectedLog.body
                  : JSON.stringify(selectedLog.body, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <span className="text-slate-500 block">Response JSON/Text:</span>
            <pre className="bg-slate-900 p-2 rounded border border-slate-850 text-sky-300 overflow-x-auto text-[9px] max-h-36">
              {JSON.stringify(selectedLog.response, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
};

export default ConsoleLog;
