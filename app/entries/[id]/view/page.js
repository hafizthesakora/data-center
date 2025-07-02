// File: app/entries/[id]/view/page.js

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// --- DISPLAY COMPONENTS ---
// These components are for displaying data in a read-only format.

const DataPair = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{String(value) || 'N/A'}</dd>
  </div>
);

const AvrDisplay = ({ data = {} }) => (
  <div className="p-6 bg-white border border-gray-200 rounded-lg">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">1. AVR Reading</h3>
    <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
      <DataPair label="Frequency" value={data.frequency} />
      <DataPair label="Power Source" value={data.power} />
      <DataPair label="Input L1/N (V)" value={data.inputVoltage?.l1n} />
      <DataPair label="Input L2/N (V)" value={data.inputVoltage?.l2n} />
      <DataPair label="Input L3/N (V)" value={data.inputVoltage?.l3n} />
      <DataPair label="Input AVG (V)" value={data.inputVoltage?.avg} />
      <DataPair label="Phase L1-L2" value={data.inputPhase?.l1l2} />
      <DataPair label="Phase L1-L3" value={data.inputPhase?.l1l3} />
      <DataPair label="Phase L2-L3" value={data.inputPhase?.l2l3} />
      <DataPair label="Output O1 (V)" value={data.outputVoltage?.o1} />
      <DataPair label="Output O2 (V)" value={data.outputVoltage?.o2} />
      <DataPair label="Output O3 (V)" value={data.outputVoltage?.o3} />
      <DataPair label="Output AVG (V)" value={data.outputVoltage?.avg} />
    </dl>
    <p className="text-sm text-gray-700 mt-4">
      <span className="font-medium">Comment:</span> {data.comment || 'None'}
    </p>
  </div>
);

const UpsDisplay = ({ title, data = {} }) => (
  <div className="p-6 bg-white border border-gray-200 rounded-lg">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
      <DataPair label="Frequency" value={data.frequency} />
      <DataPair label="Autonomy Time" value={data.autonomyTime} />
      <DataPair label="Panel Mains (V)" value={data.panelIndicators?.mains} />
      <DataPair
        label="Panel DB Leg A (V)"
        value={data.panelIndicators?.dbLegA}
      />
      <DataPair
        label="Panel DB Leg B (V)"
        value={data.panelIndicators?.dbLegB}
      />
      <DataPair label="Input L1 (V)" value={data.inputVoltage?.l1} />
      <DataPair label="Input L2 (V)" value={data.inputVoltage?.l2} />
      <DataPair label="Input L3 (V)" value={data.inputVoltage?.l3} />
      <DataPair label="Output O1 (V)" value={data.outputVoltage?.o1} />
      <DataPair label="Output O2 (V)" value={data.outputVoltage?.o2} />
      <DataPair label="Output O3 (V)" value={data.outputVoltage?.o3} />
      <DataPair label="Load PH1 (%)" value={data.loadLevel?.ph1} />
      <DataPair label="Load PH2 (%)" value={data.loadLevel?.ph2} />
      <DataPair label="Load PH3 (%)" value={data.loadLevel?.ph3} />
    </dl>
    <p className="text-sm text-gray-700 mt-4">
      <span className="font-medium">Comment:</span> {data.comment || 'None'}
    </p>
  </div>
);

const AcDisplay = ({ title, data = {} }) => (
  <div className="p-6 bg-white border border-gray-200 rounded-lg">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
      <DataPair label="Temperature" value={data.temperature} />
      <DataPair label="Humidity" value={data.humidity} />
    </dl>
    <p className="text-sm text-gray-700 mt-4">
      <span className="font-medium">Comment:</span> {data.comment || 'None'}
    </p>
    <p className="text-sm text-gray-700 mt-2">
      <span className="font-medium">Action:</span> {data.action || 'None'}
    </p>
  </div>
);

const FireSuppressionDisplay = ({ data = {} }) => (
  <div className="p-6 bg-white border border-gray-200 rounded-lg">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">
      16. Fire Suppression System
    </h3>
    <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
      <DataPair label="Cylinder Gauge 1" value={data.cylinderGauge1} />
      <DataPair label="Cylinder Gauge 2" value={data.cylinderGauge2} />
      <DataPair label="Control Panel 1" value={data.controlPanel1} />
      <DataPair label="Control Panel 2" value={data.controlPanel2} />
    </dl>
    <p className="text-sm text-gray-700 mt-4">
      <span className="font-medium">Comment:</span> {data.comment || 'None'}
    </p>
    <p className="text-sm text-gray-700 mt-2">
      <span className="font-medium">Action:</span> {data.action || 'None'}
    </p>
  </div>
);

// --- MAIN PAGE COMPONENT ---
export default function ViewEntryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [entry, setEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchEntry = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/entries/${id}`);
          if (res.ok) {
            const data = await res.json();
            setEntry(data);
          } else {
            setEntry(null);
          }
        } catch (error) {
          console.error('Failed to fetch entry', error);
          setEntry(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchEntry();
    }
  }, [id]);

  if (isLoading) {
    return <div className="text-center p-10">Loading Entry Data...</div>;
  }

  if (!entry || !entry.data) {
    return (
      <div className="text-center p-10 text-red-500">
        Could not load data for this entry.
      </div>
    );
  }

  const { data } = entry;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-xl sticky top-4 z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Viewing Entry {entry.entryNumber}
            </h1>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Back to Cycle
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-sm text-gray-600">
            <DataPair label="Staff Name" value={data.avr?.staffName} />
            <DataPair label="Date Submitted" value={data.avr?.date} />
            <DataPair label="Time Submitted" value={data.avr?.time} />
          </div>
        </div>

        <AvrDisplay data={data.avr} />
        <UpsDisplay title="2. UPS 1 (40kva)" data={data.ups40_1} />
        <UpsDisplay title="3. UPS 2 (40kva)" data={data.ups40_2} />
        <UpsDisplay title="4. UPS 1 (80kva)" data={data.ups80_1} />
        <UpsDisplay title="5. UPS 2 (80kva)" data={data.ups80_2} />
        <AcDisplay title="6. PRECISION AC 1" data={data.pac1} />
        <AcDisplay title="7. PRECISION AC 2" data={data.pac2} />
        <AcDisplay title="8. POWER RM AC 1" data={data.pwrAc1} />
        <AcDisplay title="9. POWER RM AC 2" data={data.pwrAc2} />
        <AcDisplay title="10. POWER RM AC 3" data={data.pwrAc3} />
        <AcDisplay title="11. POWER RM AC 4" data={data.pwrAc4} />
        <AcDisplay title="12. AVR ROOM AC 1" data={data.avrAc1} />
        <AcDisplay title="13. AVR ROOM AC 2" data={data.avrAc2} />
        <AcDisplay title="14. DR TF AC 1" data={data.drTfAc1} />
        <AcDisplay title="15. DR TF AC 2" data={data.drTfAc2} />
        <FireSuppressionDisplay data={data.fireSys} />
      </div>
    </div>
  );
}
