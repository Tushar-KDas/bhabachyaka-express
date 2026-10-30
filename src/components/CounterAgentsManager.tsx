'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  Building2,
  Phone,
  Mail,
  Shield,
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Edit2,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Locale } from '@/lib/i18n';

interface CounterAssignment {
  id: string;
  role: string;
  counterId: string;
  counter?: {
    id: string;
    name: string;
    nameBn: string;
    city: string;
    location: string;
  };
}

interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  counterAssignments?: CounterAssignment[];
}

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  counterAssignments?: CounterAssignment[];
}

interface CounterOption {
  id: string;
  name: string;
  nameBn: string;
  city: string;
  location: string;
  phone?: string | null;
}

interface Props {
  locale: Locale;
  isAdmin?: boolean; // true for Super Admin, false for Operator
}

export default function CounterAgentsManager({ locale, isAdmin = false }: Props) {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [counters, setCounters] = useState<CounterOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [counterFilter, setCounterFilter] = useState('ALL');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<'REGISTERED' | 'NEW'>('REGISTERED');

  // Form: Assign Registered User
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assignCounterId, setAssignCounterId] = useState('');
  const [assignRole, setAssignRole] = useState('COUNTER_AGENT');

  // Form: Create Brand New Agent
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('password123');
  const [newCounterId, setNewCounterId] = useState('');
  const [newRole, setNewRole] = useState('COUNTER_AGENT');

  // Change Counter Modal
  const [reassigningAgent, setReassigningAgent] = useState<StaffUser | null>(null);
  const [newAssignedCounterId, setNewAssignedCounterId] = useState('');

  // Notifications & Loaders
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/operator/staff');
      const data = await res.json();
      if (data.success) {
        setStaff(data.staff || []);
        setRegisteredUsers(data.registeredUsers || []);
        setCounters(data.counters || []);

        if (data.counters?.length > 0) {
          setAssignCounterId(data.counters[0].id);
          setNewCounterId(data.counters[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load agents:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staff.filter((st) => {
      const matchesSearch =
        !searchQuery ||
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (st.phone && st.phone.includes(searchQuery)) ||
        (st.counterAssignments?.[0]?.counter?.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (st.counterAssignments?.[0]?.counter?.nameBn.includes(searchQuery));

      const matchesCounter =
        counterFilter === 'ALL' ||
        st.counterAssignments?.some((ca) => ca.counterId === counterFilter);

      return matchesSearch && matchesCounter;
    });
  }, [staff, searchQuery, counterFilter]);

  // Registered users that are not already active counter agents
  const availableRegisteredUsers = useMemo(() => {
    return registeredUsers.filter((u) => {
      // Prioritize users with CUSTOMER role or users not currently assigned to this counter
      return true;
    });
  }, [registeredUsers]);

  // Selected registered user info preview
  const selectedUser = useMemo(() => {
    return registeredUsers.find((u) => u.id === selectedUserId);
  }, [registeredUsers, selectedUserId]);

  // ----------------------------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------------------------

  // 1. Assign existing registered user as counter agent
  const handleAssignRegistered = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setErrorNotice(locale === 'bn' ? 'অনুগ্রহ করে একজন নিবন্ধিত ব্যবহারকারী নির্বাচন করুন।' : 'Please select a registered user.');
      return;
    }

    setIsSubmitting(true);
    setErrorNotice('');
    setSuccessNotice('');

    try {
      const res = await fetch('/api/operator/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIGN_REGISTERED',
          userId: selectedUserId,
          counterId: assignCounterId,
          role: assignRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessNotice(
          locale === 'bn'
            ? `✅ ${selectedUser?.name || 'ব্যবহারকারী'}-কে সফলভাবে কাউন্টার এজেন্ট হিসেবে নিযুক্ত করা হয়েছে!`
            : `✅ Successfully assigned ${selectedUser?.name || 'user'} as Counter Agent!`
        );
        setIsAddModalOpen(false);
        setSelectedUserId('');
        loadData();
      } else {
        setErrorNotice(data.error || 'Failed to assign counter agent');
      }
    } catch {
      setErrorNotice('Network error while assigning agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Create brand new agent account
  const handleCreateNewAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      setErrorNotice(locale === 'bn' ? 'নাম ও ইমেইল অবশ্যই দিতে হবে।' : 'Name and email are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorNotice('');
    setSuccessNotice('');

    try {
      const res = await fetch('/api/operator/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_NEW',
          name: newName.trim(),
          email: newEmail.trim(),
          phone: newPhone.trim(),
          password: newPassword,
          counterId: newCounterId,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessNotice(
          locale === 'bn'
            ? `✅ নতুন কাউন্টার এজেন্ট আইডি (${newEmail}) সফলভাবে তৈরি হয়েছে!`
            : `✅ New counter agent ID (${newEmail}) created successfully!`
        );
        setIsAddModalOpen(false);
        setNewName('');
        setNewEmail('');
        setNewPhone('');
        loadData();
      } else {
        setErrorNotice(data.error || 'Failed to create agent');
      }
    } catch {
      setErrorNotice('Network error while creating agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Toggle agent active status
  const handleToggleStatus = async (user: StaffUser) => {
    try {
      const res = await fetch('/api/operator/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_STATUS',
          userId: user.id,
          isActive: !user.isActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStaff((prev) =>
          prev.map((s) => (s.id === user.id ? { ...s, isActive: !s.isActive } : s))
        );
        setSuccessNotice(
          locale === 'bn'
            ? `এজেন্ট স্ট্যাটাস ${!user.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে।`
            : `Agent status updated to ${!user.isActive ? 'Active' : 'Inactive'}.`
        );
        setTimeout(() => setSuccessNotice(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Change Counter assignment
  const handleReassignCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningAgent) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/operator/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHANGE_COUNTER',
          userId: reassigningAgent.id,
          counterId: newAssignedCounterId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessNotice(locale === 'bn' ? 'কাউন্টার শাখা সফলভাবে পরিবর্তন করা হয়েছে।' : 'Counter assignment updated successfully.');
        setReassigningAgent(null);
        loadData();
        setTimeout(() => setSuccessNotice(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Revoke agent role (demote to CUSTOMER)
  const handleRevokeAgent = async (user: StaffUser) => {
    if (
      !confirm(
        locale === 'bn'
          ? `আপনি কি নিশ্চিত যে ${user.name}-এর কাউন্টার এজেন্ট ক্ষমতা বাতিল করতে চান? (তিনি সাধারণ রেজিস্টার্ড কাস্টমার হিসেবে থাকবেন)`
          : `Revoke agent privileges for ${user.name}? (They will remain as a regular customer)`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/operator/staff?userId=${user.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setSuccessNotice(locale === 'bn' ? 'কাউন্টার এজেন্ট ক্ষমতা সফলভাবে বাতিল করা হয়েছে।' : 'Counter agent role revoked.');
        loadData();
        setTimeout(() => setSuccessNotice(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-50 text-[#FF6B00] border border-orange-200">
              <UserCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-[#0B1F3A]">
              {locale === 'bn' ? 'কাউন্টার এজেন্ট ও বুকিং স্টাফ ব্যবস্থাপনা' : 'Counter Agents & Staff Management'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {locale === 'bn'
              ? 'নিবন্ধিত যেকোনো ব্যবহারকারীকে কাউন্টার এজেন্ট হিসেবে নিযুক্ত করুন অথবা নতুন এজেন্ট অ্যাকাউন্ট তৈরি করুন।'
              : 'Assign existing registered users to official terminal counters or create new agent accounts.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            type="button"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setIsAddModalOpen(true);
              setAddMode('REGISTERED');
            }}
            type="button"
            className="px-5 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#FF6B00] text-white text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <UserPlus className="w-4 h-4 text-[#FFB020]" />
            <span>{locale === 'bn' ? '+ কাউন্টার এজেন্ট যুক্ত করুন' : '+ Add Counter Agent'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {locale === 'bn' ? 'মোট কাউন্টার এজেন্ট' : 'Total Agents'}
          </span>
          <span className="text-2xl font-black text-[#0B1F3A] block">{staff.length}</span>
          <span className="text-[11px] text-slate-500">
            {locale === 'bn' ? 'টার্মিনাল সেলস টিম' : 'Terminal Sales Team'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {locale === 'bn' ? 'সক্রিয় এজেন্ট' : 'Active Agents'}
          </span>
          <span className="text-2xl font-black text-emerald-600 block">
            {staff.filter((s) => s.isActive).length}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold">
            {locale === 'bn' ? 'টিকিট বিক্রয়ে অনুমোদিত' : 'Authorized for Ticketing'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {locale === 'bn' ? 'নিযুক্ত কাউন্টার শাখা' : 'Active Counters'}
          </span>
          <span className="text-2xl font-black text-[#FF6B00] block">{counters.length}</span>
          <span className="text-[11px] text-slate-500">
            {locale === 'bn' ? 'টার্মিনাল আউটলেট' : 'Terminal Outlets'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {locale === 'bn' ? 'নিবন্ধিত ইউজার পুল' : 'Registered Users Pool'}
          </span>
          <span className="text-2xl font-black text-blue-600 block">{registeredUsers.length}</span>
          <span className="text-[11px] text-blue-700 font-semibold">
            {locale === 'bn' ? 'সিলেক্টের জন্য প্রস্তুত' : 'Ready for Agent Role'}
          </span>
        </div>
      </div>

      {/* Notifications */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}
      {errorNotice && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-3 animate-fade-in shadow-2xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={locale === 'bn' ? 'নাম, ইমেইল, মোবাইল বা কাউন্টার দিয়ে খুঁজুন...' : 'Search agent name, email, phone...'}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
            {locale === 'bn' ? 'কাউন্টার ফিল্টার:' : 'Filter by Counter:'}
          </span>
          <select
            value={counterFilter}
            onChange={(e) => setCounterFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 w-full sm:w-auto"
          >
            <option value="ALL">{locale === 'bn' ? 'সকল কাউন্টার (All Counters)' : 'All Counters'}</option>
            {counters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameBn || c.name} ({c.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold">
                <th className="py-3.5 px-6">এজেন্টের নাম ও প্রোফাইল</th>
                <th className="py-3.5 px-4">লগইন ইমেইল</th>
                <th className="py-3.5 px-4">মোবাইল নম্বর</th>
                <th className="py-3.5 px-4">নিযুক্ত কাউন্টার শাখা</th>
                <th className="py-3.5 px-4">পদবী / রোল</th>
                <th className="py-3.5 px-4 text-center">স্ট্যাটাস</th>
                <th className="py-3.5 px-6 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs font-medium">
                    {locale === 'bn' ? 'কোনো কাউন্টার এজেন্ট পাওয়া যায়নি।' : 'No counter agents found.'}
                  </td>
                </tr>
              ) : (
                filteredStaff.map((agent) => {
                  const assignedCounter = agent.counterAssignments?.[0]?.counter;

                  return (
                    <tr key={agent.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0B1F3A] to-[#153B63] text-white flex items-center justify-center font-black text-xs shadow-xs">
                            {agent.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-black text-sm text-[#0B1F3A] block">{agent.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {locale === 'bn' ? 'যুক্ত হয়েছেন: ' : 'Joined: '}
                              {new Date(agent.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Login Email */}
                      <td className="py-4 px-4 font-mono text-slate-600 text-xs">
                        {agent.email}
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-4 font-bold text-slate-800">
                        {agent.phone || (
                          <span className="text-slate-400 font-normal italic">
                            {locale === 'bn' ? 'দেওয়া হয়নি' : 'Not set'}
                          </span>
                        )}
                      </td>

                      {/* Assigned Counter */}
                      <td className="py-4 px-4">
                        {assignedCounter ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200 text-[#FF6B00] font-black text-xs">
                            <Building2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{assignedCounter.nameBn || assignedCounter.name}</span>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs">
                            {locale === 'bn' ? 'যেকোনো কাউন্টার / হেড অফিস' : 'Central Floating Agent'}
                          </span>
                        )}
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 text-[11px]">
                          {agent.role === 'COUNTER_AGENT'
                            ? locale === 'bn'
                              ? 'কাউন্টার বুকিং এজেন্ট'
                              : 'Counter Agent'
                            : agent.role === 'COUNTER_MANAGER'
                            ? locale === 'bn'
                              ? 'কাউন্টার ম্যানেজার'
                              : 'Counter Manager'
                            : agent.role}
                        </span>
                      </td>

                      {/* Active Status Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(agent)}
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all cursor-pointer ${
                            agent.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {agent.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReassigningAgent(agent);
                              setNewAssignedCounterId(assignedCounter?.id || counters[0]?.id || '');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title={locale === 'bn' ? 'কাউন্টার পরিবর্তন' : 'Change Counter'}
                          >
                            <Edit2 className="w-3 h-3 text-blue-600" />
                            <span>{locale === 'bn' ? 'কাউন্টার বদল' : 'Reassign'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRevokeAgent(agent)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer"
                            title={locale === 'bn' ? 'এজেন্ট পদ বাতিল (কাস্টমার রোলে ফেরত)' : 'Revoke Agent Role'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL: ADD COUNTER AGENT (Select Registered OR Create New)            */}
      {/* ==================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-orange-50 text-[#FF6B00]">
                  <UserPlus className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-black text-[#0B1F3A]">
                  {locale === 'bn' ? 'কাউন্টার এজেন্ট যুক্ত করুন' : 'Add Counter Agent'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Selector Tabs (User's specific requirement) */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-black">
              <button
                type="button"
                onClick={() => setAddMode('REGISTERED')}
                className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  addMode === 'REGISTERED'
                    ? 'bg-white text-[#0B1F3A] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4 text-[#FF6B00]" />
                <span>{locale === 'bn' ? 'নিবন্ধিত ইউজার থেকে নির্বাচন' : 'From Registered Users'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAddMode('NEW')}
                className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  addMode === 'NEW'
                    ? 'bg-white text-[#0B1F3A] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plus className="w-4 h-4 text-blue-600" />
                <span>{locale === 'bn' ? 'নতুন এজেন্ট তৈরি করুন' : 'Create Brand New'}</span>
              </button>
            </div>

            {/* TAB 1: SELECT FROM REGISTERED USERS */}
            {addMode === 'REGISTERED' && (
              <form onSubmit={handleAssignRegistered} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    {locale === 'bn' ? 'নিবন্ধিত ব্যবহারকারী নির্বাচন করুন *' : 'Select Registered User *'}
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  >
                    <option value="">{locale === 'bn' ? '-- একজন নিবন্ধিত ব্যবহারকারী বেছে নিন --' : '-- Choose a registered user --'}</option>
                    {availableRegisteredUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.email} {u.phone ? `(${u.phone})` : ''} [{u.role}]
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {locale === 'bn'
                      ? '💡 ওয়েবসাইটে যারা ইতিমধ্যে অ্যাকাউন্ট রেজিস্টার করেছেন, তাদের যেকোনো একজনকে বেছে নিন।'
                      : '💡 Choose any user who previously signed up on the platform.'}
                  </p>
                </div>

                {/* Selected User Preview Badge */}
                {selectedUser && (
                  <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/80 space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#FF6B00] block">
                      {locale === 'bn' ? 'নির্বাচিত ব্যবহারকারীর তথ্য:' : 'Selected User Profile:'}
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-800 text-sm">{selectedUser.name}</span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-orange-200 text-[10px] font-bold text-slate-600">
                        বর্তমান রোল: {selectedUser.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 space-x-2">
                      <span>📧 {selectedUser.email}</span>
                      {selectedUser.phone && <span>• 📱 {selectedUser.phone}</span>}
                    </div>
                  </div>
                )}

                {/* Counter Dropdown */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    {locale === 'bn' ? 'কাউন্টার শাখা নির্ধারণ করুন *' : 'Assign to Terminal Counter *'}
                  </label>
                  <select
                    value={assignCounterId}
                    onChange={(e) => setAssignCounterId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  >
                    {counters.map((c) => (
                      <option key={c.id} value={c.id}>
                        📍 {c.nameBn || c.name} — {c.city} ({c.location})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role selection */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    {locale === 'bn' ? 'পদবী / দায়িত্ব *' : 'Staff Role *'}
                  </label>
                  <select
                    value={assignRole}
                    onChange={(e) => setAssignRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  >
                    <option value="COUNTER_AGENT">{locale === 'bn' ? 'কাউন্টার বুকিং এজেন্ট (Counter Booking Agent)' : 'Counter Booking Agent'}</option>
                    <option value="COUNTER_MANAGER">{locale === 'bn' ? 'কাউন্টার ম্যানেজার / ইনচার্জ (Counter Manager)' : 'Counter Manager'}</option>
                    <option value="BOARDING_STAFF">{locale === 'bn' ? 'বোর্ডিং অফিসার / সুপারভাইজার (Boarding Staff)' : 'Boarding Supervisor'}</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                  >
                    {locale === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-black shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{isSubmitting ? (locale === 'bn' ? 'নিযুক্ত হচ্ছে...' : 'Assigning...') : (locale === 'bn' ? 'কাউন্টার এজেন্ট হিসেবে নিযুক্ত করুন' : 'Assign as Counter Agent')}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: CREATE BRAND NEW AGENT */}
            {addMode === 'NEW' && (
              <form onSubmit={handleCreateNewAgent} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">
                      {locale === 'bn' ? 'এজেন্টের নাম *' : 'Agent Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder={locale === 'bn' ? 'যেমন: মোঃ আল আমিন' : 'e.g. Al Amin'}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">
                      {locale === 'bn' ? 'লগইন ইমেইল এড্রেস *' : 'Login Email *'}
                    </label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="agent@bhabachyaka.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">
                      {locale === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">
                      {locale === 'bn' ? 'লগইন পাসওয়ার্ড *' : 'Login Password *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="password123"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    {locale === 'bn' ? 'কাউন্টার শাখা নির্ধারণ করুন *' : 'Select Terminal Counter *'}
                  </label>
                  <select
                    value={newCounterId}
                    onChange={(e) => setNewCounterId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  >
                    {counters.map((c) => (
                      <option key={c.id} value={c.id}>
                        📍 {c.nameBn || c.name} — {c.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    {locale === 'bn' ? 'পদবী / দায়িত্ব *' : 'Staff Role *'}
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  >
                    <option value="COUNTER_AGENT">{locale === 'bn' ? 'কাউন্টার বুকিং এজেন্ট' : 'Counter Booking Agent'}</option>
                    <option value="COUNTER_MANAGER">{locale === 'bn' ? 'কাউন্টার ম্যানেজার' : 'Counter Manager'}</option>
                    <option value="BOARDING_STAFF">{locale === 'bn' ? 'বোর্ডিং সুপারভাইজার' : 'Boarding Supervisor'}</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                  >
                    {locale === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-black shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isSubmitting ? (locale === 'bn' ? 'তৈরি হচ্ছে...' : 'Creating...') : (locale === 'bn' ? 'নতুন আইডি তৈরি করুন' : 'Create Agent Account')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CHANGE COUNTER BRANCH                                         */}
      {/* ==================================================================== */}
      {reassigningAgent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-[#0B1F3A] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#FF6B00]" />
                <span>{locale === 'bn' ? 'কাউন্টার শাখা পরিবর্তন' : 'Reassign Counter'}</span>
              </h3>
              <button onClick={() => setReassigningAgent(null)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">এজেন্ট:</span>
                <span className="font-black text-sm text-[#0B1F3A] block">{reassigningAgent.name}</span>
                <span className="font-mono text-slate-500 text-[11px] block">{reassigningAgent.email}</span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  {locale === 'bn' ? 'নতুন কাউন্টার নির্বাচন করুন *' : 'Select New Counter *'}
                </label>
                <select
                  value={newAssignedCounterId}
                  onChange={(e) => setNewAssignedCounterId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                >
                  {counters.map((c) => (
                    <option key={c.id} value={c.id}>
                      📍 {c.nameBn || c.name} — {c.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReassigningAgent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
              >
                {locale === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleReassignCounter}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#FF6B00] text-white text-xs font-black shadow"
              >
                {isSubmitting ? (locale === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (locale === 'bn' ? 'কাউন্টার আপডেট করুন' : 'Update Counter')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
