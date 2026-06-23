'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import toast, { Toaster } from 'react-hot-toast';
import { Briefcase } from '@gravity-ui/icons';
import { createTask } from '@/lib/api/client/newTasks';

// ─── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
    'Web Development',
    'Mobile Development',
    'UI / UX Design',
    'Graphic Design',
    'Copywriting & Content',
    'Video & Animation',
    'Data Entry',
    'Digital Marketing',
    'SEO',
    'Customer Support',
    'Accounting & Finance',
    'Other',
];

// ─── Reusable field wrapper ───────────────────────────────────────────────────
function Field({ label, hint, required, children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <label style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.13em',
                    textTransform: 'uppercase', fontFamily: 'monospace',
                    color: 'rgba(255,255,255,0.45)',
                }}>
                    {label}
                    {required && <span style={{ color: '#ff4d00', marginLeft: 3 }}>*</span>}
                </label>
                {hint && (
                    <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.22)', fontFamily: 'monospace' }}>
                        {hint}
                    </span>
                )}
            </div>
            {children}
        </div>
    );
}

// ─── Shared input style factory ───────────────────────────────────────────────
function inputStyle(focused) {
    return {
        width: '100%',
        padding: '11px 14px',
        borderRadius: 10,
        border: `1px solid ${focused ? '#ff4d00' : 'rgba(255,255,255,0.09)'}`,
        backgroundColor: focused ? 'rgba(255,77,0,0.05)' : 'rgba(255,255,255,0.04)',
        color: '#fff',
        fontSize: 14,
        outline: 'none',
        transition: 'all 0.2s',
        boxShadow: focused ? '0 0 0 3px rgba(255,77,0,0.10)' : 'none',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, sans-serif',
    };
}

// ─── Focusable text input ─────────────────────────────────────────────────────
function TextInput({ name, placeholder, required, type = 'text', ...rest }) {
    const [focused, setFocused] = useState(false);
    return (
        <input
            name={name}
            type={type}
            placeholder={placeholder}
            required={required}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={inputStyle(focused)}
            {...rest}
        />
    );
}

// ─── Focusable textarea ───────────────────────────────────────────────────────
function TextArea({ name, placeholder, required, rows = 5 }) {
    const [focused, setFocused] = useState(false);
    return (
        <textarea
            name={name}
            placeholder={placeholder}
            required={required}
            rows={rows}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
                ...inputStyle(focused),
                resize: 'vertical',
                minHeight: 120,
                lineHeight: 1.65,
            }}
        />
    );
}

// ─── Focusable select ─────────────────────────────────────────────────────────
function Select({ name, required, children }) {
    const [focused, setFocused] = useState(false);
    return (
        <select
            name={name}
            required={required}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
                ...inputStyle(focused),
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.35)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                paddingRight: 36,
                cursor: 'pointer',
            }}
        >
            {children}
        </select>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ClientPostTask() {
    const { data: session } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    // ── Form submit ────────────────────────────────────────────────────────────


    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);

        const title = formData.get('title')?.trim();
        const category = formData.get('category');
        const description = formData.get('description')?.trim();
        const budget = formData.get('budget');
        const deadline = formData.get('deadline');

        // ── Validation ──
        if (!title || title.length < 5) {
            toast.error('Task title must be at least 5 characters.');
            setLoading(false);
            return;
        }
        if (!category) {
            toast.error('Please select a category.');
            setLoading(false);
            return;
        }
        if (!description || description.length < 20) {
            toast.error('Description must be at least 20 characters.');
            setLoading(false);
            return;
        }
        if (!budget || Number(budget) <= 0) {
            toast.error('Enter a valid budget greater than $0.');
            setLoading(false);
            return;
        }
        if (!deadline) {
            toast.error('Please set a deadline.');
            setLoading(false);
            return;
        }
        if (new Date(deadline) <= new Date()) {
            toast.error('Deadline must be a future date.');
            setLoading(false);
            return;
        }

        // ── Prepare Data ──
        const taskData = {
            title,
            category,
            description,
            budget: Number(budget),
            deadline,

            // 🔥 attach client info from session
            clientId: session?.user?.id,
            clientName: session?.user?.name,
            clientEmail: session?.user?.email,
        };

        if (!session?.user) {
            toast.error("You must be logged in!");
            setLoading(false);
            return;
        }

        try {
            const result = await createTask(taskData);

            console.log(result);

            if (result.insertedId) {
                toast.success('Task created successfully!');
                e.target.reset(); // clear form
            } else {
                toast.error('Failed to create task.');
            }

        } catch (error) {
            console.error(error);
            toast.error('Something went wrong!');
        }

        setLoading(false);
    }

    // ── Today's date for min deadline ──────────────────────────────────────────
    const todayISO = new Date().toISOString().split('T')[0];

    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: '#1a1a1a',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: 13,
                        borderRadius: 10,
                    },
                    error: {
                        iconTheme: { primary: '#ff4d00', secondary: '#1a1a1a' },
                    },
                    success: {
                        iconTheme: { primary: '#22c55e', secondary: '#1a1a1a' },
                    },
                }}
            />

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
                select option { background: #111; color: #fff; }
                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(0.5);
                    cursor: pointer;
                }
                .post-submit:hover:not(:disabled) {
                    box-shadow: 0 0 28px rgba(255,77,0,0.45) !important;
                    transform: translateY(-1px);
                }
                .post-submit:active:not(:disabled) { transform: translateY(0); }
            `}</style>

            <div style={{
                maxWidth: 680,
                margin: '0 auto',
                padding: '40px 24px 80px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
            }}>

                {/* ── Page header ── */}
                <div style={{ marginBottom: 36 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        padding: '4px 11px', borderRadius: 99, marginBottom: 14,
                        background: 'rgba(255,77,0,0.08)',
                        border: '1px solid rgba(255,77,0,0.22)',
                    }}>
                        <Briefcase width={12} height={12} style={{ color: '#ff4d00' }} />
                        <span style={{
                            fontSize: 10, fontWeight: 700, color: '#ff4d00',
                            letterSpacing: '0.15em', textTransform: 'uppercase',
                            fontFamily: 'monospace',
                        }}>
                            New Task
                        </span>
                    </div>
                    <h1 style={{
                        fontSize: 26, fontWeight: 900, color: '#fff',
                        letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 8px',
                    }}>
                        Post a task
                    </h1>
                    <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.6 }}>
                        Describe what you need done and freelancers will send you proposals.
                    </p>
                </div>

                {/* ── Form ── */}
                <form onSubmit={handleSubmit} noValidate>
                    <div style={{
                        background: 'rgba(255,255,255,0.025)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 16,
                        padding: '28px 28px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 22,
                    }}>

                        {/* Title */}
                        <Field label="Task Title" required>
                            <TextInput
                                name="title"
                                placeholder="e.g. Build a landing page for my SaaS product"
                                required
                                maxLength={120}
                            />
                        </Field>

                        {/* Category */}
                        <Field label="Category" required>
                            <Select name="category" required>
                                <option value="">Select a category…</option>
                                {CATEGORIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </Select>
                        </Field>

                        {/* Description */}
                        <Field
                            label="Description"
                            required
                            hint="Min. 20 characters"
                        >
                            <TextArea
                                name="description"
                                placeholder="Describe the task in detail — what you need, any requirements, preferred tools or skills, deliverables, etc."
                                required
                                rows={6}
                            />
                        </Field>

                        {/* Budget + Deadline — side by side */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 16,
                        }}
                            className="post-grid"
                        >
                            {/* Budget */}
                            <Field label="Budget" required hint="USD">
                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute', left: 13, top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontSize: 14, color: 'rgba(255,255,255,0.3)',
                                        pointerEvents: 'none', userSelect: 'none',
                                    }}>
                                        $
                                    </span>
                                    <TextInput
                                        name="budget"
                                        type="number"
                                        placeholder="250"
                                        required
                                        min="1"
                                        step="1"
                                        style={{ paddingLeft: 26 }}
                                    />
                                </div>
                            </Field>

                            {/* Deadline */}
                            <Field label="Deadline" required>
                                <TextInput
                                    name="deadline"
                                    type="date"
                                    required
                                    min={todayISO}
                                />
                            </Field>
                        </div>

                        {/* Divider */}
                        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '2px 0' }} />

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="post-submit"
                            style={{
                                width: '100%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: 9,
                                padding: '13px 20px',
                                borderRadius: 11, border: 'none',
                                background: loading
                                    ? 'rgba(255,77,0,0.4)'
                                    : 'linear-gradient(135deg, #ff4d00 0%, #cc3d00 100%)',
                                boxShadow: loading ? 'none' : '0 0 20px rgba(255,77,0,0.28)',
                                color: '#fff',
                                fontSize: 14.5, fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            {loading ? (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                        style={{ animation: 'spin 0.75s linear infinite', flexShrink: 0 }}>
                                        <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
                                        <path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Publishing…
                                </>
                            ) : (
                                <>
                                    <Briefcase width={16} height={16} />
                                    Publish Task
                                </>
                            )}
                        </button>

                    </div>
                </form>

                {/* ── Responsive grid collapse ── */}
                <style>{`
                    @media (max-width: 520px) {
                        .post-grid { grid-template-columns: 1fr !important; }
                    }
                `}</style>
            </div>
        </>
    );
}