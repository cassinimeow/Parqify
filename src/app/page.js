'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Input from '@/components/ui/Input';

export default function Home() {
  const [activeTab, setActiveTab] = useState('design-system');
  const [btnLoading, setBtnLoading] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [inputError, setInputError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBooked, setIsBooked] = useState(false);
  const [idNumber, setIdNumber] = useState('');

  // Simulates loading when button is clicked
  const handleDemoBtnClick = () => {
    setBtnLoading(true);
    setTimeout(() => setBtnLoading(false), 2000);
  };

  // Basic input validation demo
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputVal(val);
    if (val.length > 0 && !/^\d{4}-\d{5}-MN-\d$/i.test(val)) {
      setInputError('Must match format: YYYY-XXXXX-MN-X (e.g., 2023-00123-MN-0)');
    } else {
      setInputError('');
    }
  };

  // Interactive booking simulation
  const handleBookSlot = (e) => {
    e.preventDefault();
    if (!idNumber) {
      alert('Please enter your PUP Student/Employee ID first.');
      return;
    }
    if (!selectedSlot) {
      alert('Please click on an available slot in the parking grid first.');
      return;
    }
    setIsBooked(true);
  };

  // Mock parking slots data
  const mockSlots = [
    { name: 'A1', status: 'OCCUPIED' },
    { name: 'A2', status: 'AVAILABLE' },
    { name: 'A3', status: 'OCCUPIED' },
    { name: 'A4', status: 'AVAILABLE' },
    { name: 'A5', status: 'AVAILABLE' },
    { name: 'A6', status: 'RESERVED' },
    { name: 'B1', status: 'AVAILABLE' },
    { name: 'B2', status: 'OCCUPIED' },
    { name: 'B3', status: 'AVAILABLE' },
    { name: 'B4', status: 'OCCUPIED' },
    { name: 'B5', status: 'AVAILABLE' },
    { name: 'B6', status: 'AVAILABLE' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-zinc-950 transition-colors duration-200">
      
      {/* Premium Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-brand-maroon-900/90 border-b border-brand-gold-500/25 px-6 py-4 flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-brand-gold-600 flex items-center justify-center font-bold text-xl text-black font-outfit shadow-inner">
            P
          </div>
          <div>
            <h1 className="text-2xl font-bold font-outfit tracking-wide flex items-center">
              PARQIFY
              <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold bg-brand-gold-500 text-brand-gold-950 rounded-full tracking-normal">
                v1.0 (Design System)
              </span>
            </h1>
            <p className="text-[10px] text-brand-maroon-200 font-sans">PUP Manila Smart Parking</p>
          </div>
        </div>

        {/* Tab Toggle Navigation */}
        <nav className="flex bg-brand-maroon-950/60 p-1 rounded-lg border border-brand-maroon-800/80">
          <button
            onClick={() => setActiveTab('design-system')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold font-sans transition-all duration-200 ${
              activeTab === 'design-system'
                ? 'bg-brand-gold-600 text-brand-gold-950 shadow-sm'
                : 'text-brand-maroon-200 hover:text-white hover:bg-brand-maroon-850/40'
            }`}
          >
            Design System Specs
          </button>
          <button
            onClick={() => setActiveTab('wireframe-mockup')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold font-sans transition-all duration-200 ${
              activeTab === 'wireframe-mockup'
                ? 'bg-brand-gold-600 text-brand-gold-950 shadow-sm'
                : 'text-brand-maroon-200 hover:text-white hover:bg-brand-maroon-850/40'
            }`}
          >
            Wireframe Prototype
          </button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* DESIGN SYSTEM TAB */}
        {activeTab === 'design-system' && (
          <div className="space-y-12">
            
            {/* Header info */}
            <div className="border-b border-gray-200 dark:border-zinc-800 pb-6">
              <h2 className="text-3xl font-extrabold font-outfit text-brand-maroon-800 dark:text-brand-gold-400">
                PUP Manila Brand UI System
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2 font-sans max-w-3xl text-sm leading-relaxed">
                Welcome to the Parqify visual foundation designed by Xyra Mayo. Here, we outline our palette, reusable layout structures, typography hierarchy, and UI elements to be utilized by the development team (Abelarde, Dinaya, Juampit, Bulic, Aguila).
              </p>
            </div>

            {/* Colors Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold font-outfit text-gray-800 dark:text-gray-200 flex items-center">
                <span className="w-1.5 h-6 bg-brand-maroon-850 rounded mr-2 inline-block"></span>
                1. Theme Color Palettes
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                
                {/* Maroon scale */}
                <Card>
                  <CardHeader>
                    <CardTitle>PUP Maroon Palette (Primary)</CardTitle>
                    <CardDescription>Official brand color. Emphasizes authority, structure, and headers.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-5 gap-2">
                    {[
                      { hex: '#fdf2f2', label: '50' },
                      { hex: '#fde8e8', label: '100' },
                      { hex: '#fbd5d5', label: '200' },
                      { hex: '#f8b4b4', label: '300' },
                      { hex: '#f38080', label: '400' },
                      { hex: '#e02424', label: '500' },
                      { hex: '#c81e1e', label: '600' },
                      { hex: '#9b1c1c', label: '700' },
                      { hex: '#800000', label: '800 (PUP)' },
                      { hex: '#610000', label: '900' }
                    ].map((col, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className="w-full h-12 rounded-lg border border-black/5 shadow-inner"
                          style={{ backgroundColor: col.hex }}
                        ></div>
                        <span className="text-[10px] font-bold mt-1 text-gray-700 dark:text-gray-300">{col.label}</span>
                        <span className="text-[8px] text-gray-400 font-mono select-all uppercase">{col.hex}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Gold scale */}
                <Card>
                  <CardHeader>
                    <CardTitle>PUP Gold Palette (Secondary/Accent)</CardTitle>
                    <CardDescription>Represents excellence. Used sparingly for highlights, secondary buttons, and active status.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-5 gap-2">
                    {[
                      { hex: '#fefdf0', label: '50' },
                      { hex: '#fefbe1', label: '100' },
                      { hex: '#fdf7c3', label: '200' },
                      { hex: '#fcf197', label: '300' },
                      { hex: '#fae65d', label: '400' },
                      { hex: '#f4d01a', label: '500' },
                      { hex: '#d4af37', label: '600 (PUP)' },
                      { hex: '#b08d27', label: '700' },
                      { hex: '#8d6b1d', label: '800' },
                      { hex: '#715316', label: '900' }
                    ].map((col, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className="w-full h-12 rounded-lg border border-black/5 shadow-inner"
                          style={{ backgroundColor: col.hex }}
                        ></div>
                        <span className="text-[10px] font-bold mt-1 text-gray-700 dark:text-gray-300">{col.label}</span>
                        <span className="text-[8px] text-gray-400 font-mono select-all uppercase">{col.hex}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

              </div>
            </section>

            {/* Typography Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold font-outfit text-gray-800 dark:text-gray-200 flex items-center">
                <span className="w-1.5 h-6 bg-brand-maroon-850 rounded mr-2 inline-block"></span>
                2. Reusable Typography
              </h3>

              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-brand-gold-700 font-bold font-sans">
                      Font Family: Outfit (Headings, Branding, Stats)
                    </span>
                    <div className="mt-2 space-y-2">
                      <h1 className="text-4xl font-extrabold font-outfit tracking-tight text-gray-900 dark:text-white">
                        H1 Title - 36px (Outfit Extrabold)
                      </h1>
                      <h2 className="text-2xl font-bold font-outfit text-gray-800 dark:text-neutral-200">
                        H2 Section - 24px (Outfit Bold)
                      </h2>
                      <h3 className="text-lg font-semibold font-outfit text-gray-700 dark:text-neutral-300">
                        H3 Card Header - 18px (Outfit Semibold)
                      </h3>
                    </div>
                  </div>

                  <hr className="border-gray-100 dark:border-zinc-800" />

                  <div>
                    <span className="text-xs uppercase tracking-widest text-brand-maroon-700 font-bold font-sans">
                      Font Family: Plus Jakarta Sans (Labels, Form Inputs, Paragraph Body)
                    </span>
                    <div className="mt-2 space-y-3 max-w-3xl">
                      <p className="text-base text-gray-700 dark:text-gray-300 font-sans leading-relaxed">
                        Body copy format (16px). Next.js loads <strong>Plus Jakarta Sans</strong> dynamically to render highly legible sentences. This font provides beautiful UI elements, inputs, forms, and instructions.
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-sans leading-relaxed">
                        Secondary body copy / helper text format (14px). Optimized for metadata description, hints, error guides, and terms.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Button Showcase */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold font-outfit text-gray-800 dark:text-gray-200 flex items-center">
                <span className="w-1.5 h-6 bg-brand-maroon-850 rounded mr-2 inline-block"></span>
                3. Button Component (Interactive)
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Live Sandbox */}
                <Card>
                  <CardHeader>
                    <CardTitle>Interactive States Sandbox</CardTitle>
                    <CardDescription>Toggle state configurations to preview UI component response dynamically.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="primary"
                        isLoading={btnLoading}
                        onClick={handleDemoBtnClick}
                      >
                        {btnLoading ? 'Processing...' : 'Click to Load'}
                      </Button>

                      <Button
                        variant="secondary"
                        disabled={btnLoading}
                        onClick={() => alert('Gold Accent Action!')}
                      >
                        Accent Action
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => alert('Outline Button Triggered')}
                      >
                        Outline
                      </Button>
                    </div>

                    <div className="bg-neutral-50 dark:bg-zinc-950 p-4 rounded-lg border border-neutral-100 dark:border-zinc-900 text-xs font-mono text-gray-600 dark:text-gray-400">
                      {'<Button variant="primary" isLoading={' + btnLoading.toString() + '}>'}<br />
                      {'  '}{btnLoading ? 'Processing...' : 'Click to Load'}<br />
                      {'</Button>'}
                    </div>
                  </CardContent>
                </Card>

                {/* All Variants & Sizes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Variants and Size Specifications</CardTitle>
                    <CardDescription>Buttons support 5 color ways and 3 height options.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-gray-400">Variants:</span>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="primary">Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="danger">Danger</Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold text-gray-400">Sizes:</span>
                      <div className="flex items-center gap-2">
                        <Button variant="primary" size="sm">Small</Button>
                        <Button variant="primary" size="md">Medium</Button>
                        <Button variant="primary" size="lg">Large</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </section>

            {/* Input & Form Elements */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold font-outfit text-gray-800 dark:text-gray-200 flex items-center">
                <span className="w-1.5 h-6 bg-brand-maroon-850 rounded mr-2 inline-block"></span>
                4. Input Component (Interactive Validation)
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Sandbox */}
                <Card>
                  <CardHeader>
                    <CardTitle>Validation Demo</CardTitle>
                    <CardDescription>Type your PUP ID to test real-time validation error borders and warnings.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      label="PUP Student/Employee ID"
                      placeholder="e.g. 2023-00123-MN-0"
                      value={inputVal}
                      onChange={handleInputChange}
                      error={inputError}
                      helperText="Must match standard PUP Manila ID registration pattern."
                      icon={
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 014 0v1m-4 1h4" />
                        </svg>
                      }
                    />

                    <div className="bg-neutral-50 dark:bg-zinc-950 p-3.5 rounded-lg border border-neutral-100 dark:border-zinc-900 text-xs font-mono text-gray-600 dark:text-gray-400">
                      {'<Input'}<br />
                      {'  label="PUP Student/Employee ID"'}<br />
                      {inputError ? '  error="' + inputError + '"' : '  /* Valid/Clean State */'}<br />
                      {'  value="' + inputVal + '"'}<br />
                      {'/>'}
                    </div>
                  </CardContent>
                </Card>

                {/* State list */}
                <Card>
                  <CardHeader>
                    <CardTitle>Input Component States</CardTitle>
                    <CardDescription>Default, with leading icon, disabled, and error styles.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      label="Default Text Input"
                      placeholder="Standard input box..."
                    />

                    <Input
                      label="With Leading Icon"
                      placeholder="Search for slots..."
                      icon={
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      }
                    />

                    <Input
                      label="Disabled State"
                      value="Cannot edit this data"
                      disabled
                    />
                  </CardContent>
                </Card>

              </div>
            </section>

            {/* Cards Showcase */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold font-outfit text-gray-800 dark:text-gray-200 flex items-center">
                <span className="w-1.5 h-6 bg-brand-maroon-850 rounded mr-2 inline-block"></span>
                5. Cards Components
              </h3>

              <div className="grid md:grid-cols-3 gap-6">
                
                <Card>
                  <CardHeader>
                    <CardTitle>Minimal Info Card</CardTitle>
                    <CardDescription>Used to convey statistics or status updates.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-extrabold font-outfit text-brand-maroon-800 dark:text-brand-gold-500">
                      24 Slots
                    </p>
                    <span className="text-xs text-gray-400 font-sans block mt-1">Available in Lot A</span>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-brand-gold-600">
                  <CardHeader>
                    <CardTitle>Accent Styled Card</CardTitle>
                    <CardDescription>Highlights important actions or notifications.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                      Your current session ends in <strong>15 minutes</strong>. Scan your RFID at exit gate to avoid penalty fees.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Action Card</CardTitle>
                    <CardDescription>Standard layout with footer controls.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                      Need help regarding your slot reservation? Tap the contact button below to request administrator assistance.
                    </p>
                  </CardContent>
                  <CardFooter className="justify-end pt-4">
                    <Button variant="outline" size="sm">Get Support</Button>
                  </CardFooter>
                </Card>

              </div>
            </section>

          </div>
        )}

        {/* WIREFRAME MOCKUP TAB */}
        {activeTab === 'wireframe-mockup' && (
          <div className="space-y-8">
            
            {/* Header info */}
            <div className="border-b border-gray-200 dark:border-zinc-800 pb-6">
              <h2 className="text-3xl font-extrabold font-outfit text-brand-maroon-800 dark:text-brand-gold-400">
                Parqify App Prototype
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2 font-sans max-w-3xl text-sm leading-relaxed">
                An interactive high-fidelity wireframe demonstrating how the login/dashboard components integrate together. 
                <strong className="text-brand-maroon-800 dark:text-brand-gold-500"> Try clicking slots in the grid</strong> to select, and fill in the form on the right!
              </p>
            </div>

            {/* Simulated app wrapper */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
              
              {/* Internal Mock Dashboard Header */}
              <div className="bg-brand-maroon-800 px-6 py-4 flex items-center justify-between text-white">
                <div className="flex items-center space-x-2">
                  <span className="h-6 w-6 rounded bg-brand-gold-600 text-black flex items-center justify-center font-bold font-outfit text-xs">P</span>
                  <span className="font-bold font-outfit tracking-wide text-sm">PARQIFY APP PORTAL</span>
                </div>
                <div className="flex items-center space-x-4 text-xs font-semibold">
                  <span className="text-brand-gold-300">PUP Main Campus Lot A</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-gray-200">Xyra Mayo</span>
                </div>
              </div>

              {/* Prototype body grid */}
              <div className="grid lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-zinc-800">
                
                {/* Column 1 & 2: Interactive Grid Selection */}
                <div className="lg:col-span-2 p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold font-outfit text-gray-800 dark:text-white">
                      Interactive Slot Map Selection
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Select one of the green AVAILABLE slots below to book your reservation.
                    </p>
                  </div>

                  {/* Lot Grid */}
                  <div className="grid grid-cols-4 gap-4">
                    {mockSlots.map((slot, index) => {
                      const isAvailable = slot.status === 'AVAILABLE';
                      const isOccupied = slot.status === 'OCCUPIED';
                      const isReserved = slot.status === 'RESERVED';
                      const isCurrentlySelected = selectedSlot === slot.name;

                      let statusBg = 'bg-gray-100 dark:bg-zinc-800 text-gray-400';
                      let statusText = 'Unavailable';
                      let cursorStyle = 'cursor-not-allowed opacity-50';

                      if (isAvailable) {
                        statusBg = isCurrentlySelected 
                          ? 'bg-brand-gold-600 text-brand-gold-950 border-brand-gold-700 shadow-lg scale-105' 
                          : 'bg-emerald-550 text-white hover:bg-emerald-600 hover:scale-102 hover:shadow-md active:scale-98 border-emerald-600 dark:bg-emerald-700';
                        statusText = isCurrentlySelected ? 'Selected' : 'Available';
                        cursorStyle = 'cursor-pointer';
                      } else if (isOccupied) {
                        statusBg = 'bg-rose-500 text-white border-rose-600 dark:bg-rose-800/80';
                        statusText = 'Occupied';
                      } else if (isReserved) {
                        statusBg = 'bg-amber-500 text-white border-amber-600 dark:bg-amber-800/80';
                        statusText = 'Reserved';
                      }

                      return (
                        <div
                          key={index}
                          onClick={() => isAvailable && setSelectedSlot(slot.name)}
                          className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all duration-200 ${statusBg} ${cursorStyle}`}
                        >
                          <span className="text-lg font-extrabold font-outfit">{slot.name}</span>
                          <span className="text-[9px] uppercase font-bold tracking-wide mt-1">{statusText}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex gap-4 items-center bg-gray-50 dark:bg-zinc-950 p-4 rounded-xl text-xs font-semibold">
                    <span className="text-gray-400">Legend:</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="h-3.5 w-3.5 rounded bg-emerald-500 inline-block"></span>
                      <span className="text-gray-600 dark:text-gray-400">Available</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="h-3.5 w-3.5 rounded bg-rose-500 inline-block"></span>
                      <span className="text-gray-600 dark:text-gray-400">Occupied</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="h-3.5 w-3.5 rounded bg-amber-500 inline-block"></span>
                      <span className="text-gray-600 dark:text-gray-400">Reserved</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="h-3.5 w-3.5 rounded bg-brand-gold-600 inline-block"></span>
                      <span className="text-gray-700 dark:text-brand-gold-400">Your Selection</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Live Form & Reservation Output */}
                <div className="p-6 bg-gray-50/50 dark:bg-zinc-900/50 space-y-6">
                  
                  {!isBooked ? (
                    <form onSubmit={handleBookSlot} className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold font-outfit text-gray-800 dark:text-white">
                          Confirm Reservation
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Complete details to issue your digital ticket QR code.
                        </p>
                      </div>

                      <Input
                        label="PUP ID Number"
                        id="pup-id-mock"
                        required
                        placeholder="e.g. 2023-00000-MN-0"
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        helperText="Required to seed RFID pairing records."
                        icon={
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        }
                      />

                      {/* Selected Slot View */}
                      <Card className="bg-white dark:bg-zinc-950 border-dashed border-gray-300 dark:border-zinc-800">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase font-bold block">Chosen Slot</span>
                            <span className="text-xl font-bold font-outfit text-brand-maroon-800 dark:text-brand-gold-500">
                              {selectedSlot ? `SLOT ${selectedSlot}` : 'None Selected'}
                            </span>
                          </div>
                          {!selectedSlot && (
                            <span className="text-[10px] text-brand-maroon-600 dark:text-brand-gold-600 animate-pulse font-semibold">
                              Click a green slot
                            </span>
                          )}
                        </CardContent>
                      </Card>

                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        disabled={!selectedSlot || !idNumber}
                      >
                        Generate Digital Ticket
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-6 text-center py-4">
                      
                      <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>

                      <div>
                        <h4 className="text-lg font-bold font-outfit text-gray-800 dark:text-white">
                          Ticket Reserved Successfully
                        </h4>
                        <p className="text-xs text-gray-400 font-sans mt-1">
                          Show this QR code at PUP Gate RFID sensor.
                        </p>
                      </div>

                      {/* Mock QR Code */}
                      <div className="relative mx-auto w-44 h-44 bg-white p-3 rounded-xl shadow-md border border-neutral-100 flex items-center justify-center">
                        
                        {/* Fake QR pattern using blocks */}
                        <div className="grid grid-cols-6 gap-1.5 w-full h-full opacity-80">
                          {Array.from({ length: 36 }).map((_, i) => {
                            const isFill = (i * 7 + 13) % 3 === 0 || i === 0 || i === 5 || i === 30 || i === 35;
                            return (
                              <div
                                key={i}
                                className={`rounded-sm ${isFill ? 'bg-zinc-900' : 'bg-transparent'}`}
                              ></div>
                            );
                          })}
                        </div>

                        {/* Centered Logo block */}
                        <div className="absolute inset-0 m-auto w-10 h-10 bg-brand-maroon-800 border-2 border-white rounded-lg flex items-center justify-center text-white text-[10px] font-bold font-outfit">
                          PUP
                        </div>
                      </div>

                      <div className="bg-brand-maroon-50/50 dark:bg-brand-maroon-950/20 border border-brand-maroon-100 dark:border-brand-maroon-900 p-4 rounded-xl text-left space-y-2 text-xs font-sans text-gray-700 dark:text-gray-300">
                        <div className="flex justify-between">
                          <span>User ID:</span>
                          <strong className="font-mono text-[11px]">{idNumber}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Lot:</span>
                          <strong>Lot A (Main Campus)</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Assigned slot:</span>
                          <span className="px-2 py-0.5 bg-brand-gold-500/20 text-brand-gold-800 dark:text-brand-gold-400 rounded-md font-bold font-outfit">Slot {selectedSlot}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Valid Duration:</span>
                          <span>3 Hours</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setIsBooked(false);
                          setSelectedSlot(null);
                          setIdNumber('');
                        }}
                      >
                        Cancel / Reset Demo
                      </Button>
                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* Brand Footer */}
      <footer className="mt-16 border-t border-gray-100 dark:border-zinc-800 py-8 px-6 text-center text-xs text-gray-400 font-sans">
        <p>© 2026 Parqify System. Created under Lead Developer Elizander Aguila and UI Designer Xyra Mayo.</p>
        <p className="mt-1 text-gray-500">Polytechnic University of the Philippines Manila Campus</p>
      </footer>

    </div>
  );
}