// File: app/entries/[id]/page.js

'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// --- FORM COMPONENT: AVR ---
const AvrForm = ({ data = {}, handleChange }) => (
  <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h2 className="text-xl font-semibold mb-4 text-gray-800">1. AVR Reading</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Frequency
        </label>
        <input
          type="text"
          name="frequency"
          value={data.frequency || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Power Source
        </label>
        <select
          name="power"
          value={data.power || 'ECG'}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option>ECG</option>
          <option>GENCERT</option>
        </select>
      </div>
    </div>

    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
        INPUT VOLTAGE READINGS (V)
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
        <input
          type="number"
          name="inputVoltage.l1n"
          value={data.inputVoltage?.l1n || ''}
          onChange={handleChange}
          placeholder="L1/N"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <input
          type="number"
          name="inputVoltage.l2n"
          value={data.inputVoltage?.l2n || ''}
          onChange={handleChange}
          placeholder="L2/N"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <input
          type="number"
          name="inputVoltage.l3n"
          value={data.inputVoltage?.l3n || ''}
          onChange={handleChange}
          placeholder="L3/N"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <input
          type="number"
          name="inputVoltage.avg"
          value={data.inputVoltage?.avg || ''}
          onChange={handleChange}
          placeholder="AVG"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
    </div>

    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
        INPUT PHASE VOLTAGES
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
        <input
          type="number"
          name="inputPhase.l1l2"
          value={data.inputPhase?.l1l2 || ''}
          onChange={handleChange}
          placeholder="L1-L2"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <input
          type="number"
          name="inputPhase.l1l3"
          value={data.inputPhase?.l1l3 || ''}
          onChange={handleChange}
          placeholder="L1-L3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <input
          type="number"
          name="inputPhase.l2l3"
          value={data.inputPhase?.l2l3 || ''}
          onChange={handleChange}
          placeholder="L2-L3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
    </div>

    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
        OUTPUT VOLTAGE READINGS (V)
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
        <input
          type="number"
          name="outputVoltage.o1"
          value={data.outputVoltage?.o1 || ''}
          onChange={handleChange}
          placeholder="O1"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <input
          type="number"
          name="outputVoltage.o2"
          value={data.outputVoltage?.o2 || ''}
          onChange={handleChange}
          placeholder="O2"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <input
          type="number"
          name="outputVoltage.o3"
          value={data.outputVoltage?.o3 || ''}
          onChange={handleChange}
          placeholder="O3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <input
          type="number"
          name="outputVoltage.avg"
          value={data.outputVoltage?.avg || ''}
          onChange={handleChange}
          placeholder="AVG"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
    </div>
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-700">Comment</label>
      <textarea
        name="comment"
        value={data.comment || ''}
        onChange={handleChange}
        rows="3"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
      ></textarea>
    </div>
  </div>
);

// --- FORM COMPONENT: UPS ---
const UpsForm = ({ title, data = {}, handleChange }) => (
  <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Frequency
        </label>
        <input
          type="text"
          name="frequency"
          value={data.frequency || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Autonomy Time
        </label>
        <input
          type="text"
          name="autonomyTime"
          value={data.autonomyTime || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
    </div>
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
        PANEL INDICATORS (V)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
        <input
          type="number"
          name="panelIndicators.mains"
          value={data.panelIndicators?.mains || ''}
          onChange={handleChange}
          placeholder="MAINS"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <input
          type="number"
          name="panelIndicators.dbLegA"
          value={data.panelIndicators?.dbLegA || ''}
          onChange={handleChange}
          placeholder="DB LEG A"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <input
          type="number"
          name="panelIndicators.dbLegB"
          value={data.panelIndicators?.dbLegB || ''}
          onChange={handleChange}
          placeholder="DB LEG B"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
    </div>
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
        INPUT VOLTAGE READINGS (V)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
        <input
          type="number"
          name="inputVoltage.l1"
          value={data.inputVoltage?.l1 || ''}
          onChange={handleChange}
          placeholder="L1"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <input
          type="number"
          name="inputVoltage.l2"
          value={data.inputVoltage?.l2 || ''}
          onChange={handleChange}
          placeholder="L2"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <input
          type="number"
          name="inputVoltage.l3"
          value={data.inputVoltage?.l3 || ''}
          onChange={handleChange}
          placeholder="L3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
    </div>
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
        OUTPUT VOLTAGE READINGS (V)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
        <input
          type="number"
          name="outputVoltage.o1"
          value={data.outputVoltage?.o1 || ''}
          onChange={handleChange}
          placeholder="O1"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <input
          type="number"
          name="outputVoltage.o2"
          value={data.outputVoltage?.o2 || ''}
          onChange={handleChange}
          placeholder="O2"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <input
          type="number"
          name="outputVoltage.o3"
          value={data.outputVoltage?.o3 || ''}
          onChange={handleChange}
          placeholder="O3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
    </div>
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
        LOAD LEVEL READINGS (%)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
        <input
          type="number"
          name="loadLevel.ph1"
          value={data.loadLevel?.ph1 || ''}
          onChange={handleChange}
          placeholder="PH1"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <input
          type="number"
          name="loadLevel.ph2"
          value={data.loadLevel?.ph2 || ''}
          onChange={handleChange}
          placeholder="PH2"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <input
          type="number"
          name="loadLevel.ph3"
          value={data.loadLevel?.ph3 || ''}
          onChange={handleChange}
          placeholder="PH3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
    </div>
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-700">Comment</label>
      <textarea
        name="comment"
        value={data.comment || ''}
        onChange={handleChange}
        rows="3"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
      ></textarea>
    </div>
  </div>
);

// --- FORM COMPONENT: AC ---
const AcForm = ({ title, data = {}, handleChange }) => (
  <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Temperature
        </label>
        <input
          type="text"
          name="temperature"
          value={data.temperature || ''}
          onChange={handleChange}
          placeholder="e.g., 22°C"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Humidity
        </label>
        <input
          type="text"
          name="humidity"
          value={data.humidity || ''}
          onChange={handleChange}
          placeholder="e.g., 55%"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
    </div>
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-700">Comment</label>
      <textarea
        name="comment"
        value={data.comment || ''}
        onChange={handleChange}
        rows="3"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
      ></textarea>
    </div>
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-700">Action</label>
      <input
        type="text"
        name="action"
        value={data.action || ''}
        onChange={handleChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
      />
    </div>
  </div>
);

// --- FORM COMPONENT: FIRE SUPPRESSION ---
const FireSuppressionForm = ({ data = {}, handleChange }) => (
  <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h2 className="text-xl font-semibold mb-4 text-gray-800">
      16. Fire Suppression System
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Cylinder Gauge 1
        </label>
        <input
          type="text"
          name="cylinderGauge1"
          value={data.cylinderGauge1 || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Cylinder Gauge 2
        </label>
        <input
          type="text"
          name="cylinderGauge2"
          value={data.cylinderGauge2 || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Control Panel 1
        </label>
        <input
          type="text"
          name="controlPanel1"
          value={data.controlPanel1 || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Control Panel 2
        </label>
        <input
          type="text"
          name="controlPanel2"
          value={data.controlPanel2 || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
    </div>
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-700">Comment</label>
      <textarea
        name="comment"
        value={data.comment || ''}
        onChange={handleChange}
        rows="3"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
      ></textarea>
    </div>
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-700">Action</label>
      <input
        type="text"
        name="action"
        value={data.action || ''}
        onChange={handleChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
      />
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---
export default function EntryFormPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();

  const id = params.id; // This is the ID of the Entry document

  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      setFormData({
        // This object will now hold data for all 16 forms
        avr: {
          staffName: session.user.name,
          date: new Date().toLocaleDateString('en-CA'),
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
        ups40_1: {},
        ups40_2: {},
        ups80_1: {},
        ups80_2: {},
        pac1: {},
        pac2: {},
        pwrAc1: {},
        pwrAc2: {},
        pwrAc3: {},
        pwrAc4: {},
        avrAc1: {},
        avrAc2: {},
        drTfAc1: {},
        drTfAc2: {},
        fireSys: {},
      });
      setIsLoading(false);
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  const handleFormChange = (formKey, e) => {
    const { name, value } = e.target;
    const [parent, child] = name.split('.');

    setFormData((prev) => ({
      ...prev,
      [formKey]: {
        ...prev[formKey],
        ...(child
          ? { [parent]: { ...prev[formKey]?.[parent], [child]: value } }
          : { [name]: value }),
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await fetch(`/api/entries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: formData }), // Send the entire formData object
    });
    if (res.ok) {
      const updatedEntry = await res.json();
      router.push(`/cycles/${updatedEntry.cycleId}`);
    } else {
      alert('Failed to submit entry. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-xl sticky top-4 z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Complete Entry</h1>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Back
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-sm text-gray-600">
            <p>
              <span className="font-semibold">Staff:</span> {session.user.name}
            </p>
            <p>
              <span className="font-semibold">Date:</span>{' '}
              {new Date().toLocaleDateString('en-CA')}
            </p>
            <p>
              <span className="font-semibold">Time:</span>{' '}
              {new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Render all 16 forms sequentially */}
        <AvrForm
          data={formData.avr}
          handleChange={(e) => handleFormChange('avr', e)}
        />
        <UpsForm
          title="2. UPS 1 (40kva)"
          data={formData.ups40_1}
          handleChange={(e) => handleFormChange('ups40_1', e)}
        />
        <UpsForm
          title="3. UPS 2 (40kva)"
          data={formData.ups40_2}
          handleChange={(e) => handleFormChange('ups40_2', e)}
        />
        <UpsForm
          title="4. UPS 1 (80kva)"
          data={formData.ups80_1}
          handleChange={(e) => handleFormChange('ups80_1', e)}
        />
        <UpsForm
          title="5. UPS 2 (80kva)"
          data={formData.ups80_2}
          handleChange={(e) => handleFormChange('ups80_2', e)}
        />
        <AcForm
          title="6. PRECISION AC 1"
          data={formData.pac1}
          handleChange={(e) => handleFormChange('pac1', e)}
        />
        <AcForm
          title="7. PRECISION AC 2"
          data={formData.pac2}
          handleChange={(e) => handleFormChange('pac2', e)}
        />
        <AcForm
          title="8. POWER RM AC 1"
          data={formData.pwrAc1}
          handleChange={(e) => handleFormChange('pwrAc1', e)}
        />
        <AcForm
          title="9. POWER RM AC 2"
          data={formData.pwrAc2}
          handleChange={(e) => handleFormChange('pwrAc2', e)}
        />
        <AcForm
          title="10. POWER RM AC 3"
          data={formData.pwrAc3}
          handleChange={(e) => handleFormChange('pwrAc3', e)}
        />
        <AcForm
          title="11. POWER RM AC 4"
          data={formData.pwrAc4}
          handleChange={(e) => handleFormChange('pwrAc4', e)}
        />
        <AcForm
          title="12. AVR ROOM AC 1"
          data={formData.avrAc1}
          handleChange={(e) => handleFormChange('avrAc1', e)}
        />
        <AcForm
          title="13. AVR ROOM AC 2"
          data={formData.avrAc2}
          handleChange={(e) => handleFormChange('avrAc2', e)}
        />
        <AcForm
          title="14. DR TF AC 1"
          data={formData.drTfAc1}
          handleChange={(e) => handleFormChange('drTfAc1', e)}
        />
        <AcForm
          title="15. DR TF AC 2"
          data={formData.drTfAc2}
          handleChange={(e) => handleFormChange('drTfAc2', e)}
        />
        <FireSuppressionForm
          data={formData.fireSys}
          handleChange={(e) => handleFormChange('fireSys', e)}
        />

        <div className="mt-8 pt-5">
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="ml-3 inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Complete Entry'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
