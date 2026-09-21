//#region src/app/diagnostics/rendered-records.ts
const mountedRecords = /* @__PURE__ */ new WeakMap();
function trackRenderedRecord(record) {
	mountedRecords.set(record, (mountedRecords.get(record) ?? 0) + 1);
	return () => {
		const count = (mountedRecords.get(record) ?? 0) - 1;
		if (count > 0) mountedRecords.set(record, count);
		else mountedRecords.delete(record);
	};
}
function isRecordRendered(record) {
	return (mountedRecords.get(record) ?? 0) > 0;
}
//#endregion
export { isRecordRendered, trackRenderedRecord };
