// ╔══════════════════════════════════════════════════════════════╗
// ║          EXAM TEMPLATE — src/config.js                      ║
// ║  This is the ONLY file you need to change per exam day.     ║
// ╚══════════════════════════════════════════════════════════════╝

const config = {

  // ── 1. APP INFO ─────────────────────────────────────────────
  appName:    'HMS',
  appSubtitle:'Hotel Management System',
  dbName:     'HMS',

  // ── 2. LAYOUT ───────────────────────────────────────────────
  // Options: 'sidebar-left' | 'sidebar-right' | 'topnav'
  layout: 'sidebar-left',

  // ── 3. COLOR THEME ──────────────────────────────────────────
  // Pick ONE. Each student in your group picks a different one.
  // Options: 'blue' | 'green' | 'purple' | 'orange'
  //          'red'  | 'teal'  | 'pink'   | 'slate'
  color: 'slate',

  // ── 4. BACKEND BASE URL ─────────────────────────────────────
  apiBase: 'http://localhost:5000',

  // ── LOCALISATION ─────────────────────────────────────────────
  currency: 'Rwf',
  locale:   'en-RW',

  // ── 5. SECURITY QUESTIONS ───────────────────────────────────
  securityQuestions: [
    "What was the name of your first pet?",
    "What is your mother's maiden name?",
    "What city were you born in?",
    "What was the name of your primary school?",
    "What is the name of the street you grew up on?",
    "What was your childhood nickname?",
  ],

  // ── 6. NAV LINKS ────────────────────────────────────────────
  // Each link maps to a page key in `pages` below.
  // icon: any name from the ICONS map in Layout.jsx
  navLinks: [
    { label: 'Dashboard',   path: '/dashboard',   icon: 'dashboard' },
    { label: 'Rooms',       path: '/rooms',       icon: 'building'  },
    { label: 'Guests',      path: '/guests',      icon: 'users'     },
    { label: 'Bookings',    path: '/bookings',    icon: 'clipboard' },
    { label: 'Payments',    path: '/payments',    icon: 'payment'   },
    { label: 'Reports',     path: '/reports',     icon: 'chart'     },
  ],

  // ── 7. PAGES (tables + forms) ───────────────────────────────
  // Each key matches a navLink path (without the leading slash, dashes→camel).
  // ops: which CRUD buttons to show. 'create' always shown on all.
  // Full ops (all 4 buttons):  ['create','update','delete']
  // Insert only (just the form): []
  //
  // Field types: 'text' | 'number' | 'date' | 'email' | 'tel'
  //              'select-static'  (options: ['A','B'])
  //              'select-api'     (source: '/api/items', labelKey: 'name')
  //              'textarea'
  //              'readonly'       (auto-calculated, shown but not submitted)

  pages: {

    rooms: {
      label:   'Rooms',
      apiPath: '/api/rooms',
      ops:     [],
      fields: [
        { name: 'Room Number',   key: 'roomNumber',   type: 'text',   required: true },
        { name: 'Room Type',     key: 'roomType',     type: 'select-static', options: ['Single','Double','Suite','Deluxe'], required: true },
        { name: 'Price/Night',   key: 'pricePerNight', type: 'number', required: true },
        { name: 'Status',        key: 'status',       type: 'select-static', options: ['Available','Booked','Maintenance'], required: true },
      ],
      tableColumns: [
        { key: 'roomNumber',    label: 'Room No.' },
        { key: 'roomType',      label: 'Type'     },
        { key: 'pricePerNight', label: 'Price/Night', format: 'number' },
        { key: 'status',        label: 'Status'   },
      ],
    },

    guests: {
      label:   'Guests',
      apiPath: '/api/guests',
      ops:     [],
      fields: [
        { name: 'Full Name',    key: 'fullName',     type: 'text',   required: true },
        { name: 'Phone',        key: 'phone',        type: 'tel',    required: true },
        { name: 'Email',        key: 'email',        type: 'email',  required: true },
        { name: 'ID Number',    key: 'idNumber',     type: 'text',   required: true },
      ],
      tableColumns: [
        { key: 'fullName',  label: 'Name'  },
        { key: 'phone',     label: 'Phone' },
        { key: 'email',     label: 'Email' },
        { key: 'idNumber',  label: 'ID No.' },
      ],
    },

    bookings: {
      label:   'Bookings',
      apiPath: '/api/bookings',
      ops:     ['update', 'delete'],
      fields: [
        { name: 'Booking No.', key: 'bookingNumber', type: 'text', required: true },
        {
          name: 'Guest',
          key:  'guestId',
          type: 'select-api',
          source:   '/api/guests',
          labelKey: 'fullName',
          required: true,
        },
        {
          name: 'Room',
          key:  'roomId',
          type: 'select-api',
          source:   '/api/rooms',
          labelKey: 'roomNumber',
          required: true,
        },
        { name: 'Check-in',  key: 'checkInDate',  type: 'date', required: true },
        { name: 'Check-out', key: 'checkOutDate', type: 'date', required: true },
        { name: 'Nights',    key: 'numberOfNights', type: 'readonly', calc: (f) => {
          if (f.checkInDate && f.checkOutDate) {
            const diff = new Date(f.checkOutDate) - new Date(f.checkInDate);
            return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
          }
          return 1;
        }},
        { name: 'Total Amount', key: 'totalAmount', type: 'number', required: true },
        { name: 'Status',       key: 'status',      type: 'select-static', options: ['Confirmed','Checked-in','Checked-out','Cancelled'], required: true },
      ],
      tableColumns: [
        { key: 'bookingNumber',        label: 'Booking No.' },
        { key: 'guestId.fullName',     label: 'Guest'    },
        { key: 'roomId.roomNumber',    label: 'Room'     },
        { key: 'checkInDate',          label: 'Check-in',  format: 'date' },
        { key: 'checkOutDate',         label: 'Check-out', format: 'date' },
        { key: 'totalAmount',          label: 'Amount',    format: 'number' },
        { key: 'status',               label: 'Status'   },
      ],
    },

    payments: {
      label:   'Payments',
      apiPath: '/api/payments',
      ops:     [],
      fields: [
        { name: 'Payment Number', key: 'paymentNumber', type: 'text',   required: true },
        {
          name: 'Booking',
          key:  'bookingId',
          type: 'select-api',
          source:   '/api/bookings',
          labelKey: 'bookingNumber',
          required: true,
        },
        { name: 'Amount Paid',  key: 'amountPaid',  type: 'number', required: true },
        { name: 'Payment Date', key: 'paymentDate', type: 'date',   required: true },
        { name: 'Method',       key: 'paymentMethod', type: 'select-static', options: ['Cash','Card','Mobile Money'], required: true },
      ],
      tableColumns: [
        { key: 'paymentNumber',        label: 'Payment No.' },
        { key: 'bookingId.bookingNumber', label: 'Booking'  },
        { key: 'amountPaid',           label: 'Amount', format: 'number' },
        { key: 'paymentDate',          label: 'Date',   format: 'date'   },
        { key: 'paymentMethod',        label: 'Method' },
      ],
    },

  }, // end pages

  // ── 8. REPORTS ──────────────────────────────────────────────
  reports: [
    {
      key:         'room-occupancy',
      label:       'Room Occupancy',
      apiPath:     '/api/reports/room-occupancy',
      description: 'View room occupancy status, current guests, and availability',
      filter: { type: 'date', param: 'date', label: 'Select Date' },
      columns: ['Room No.', 'Type', 'Price/Night', 'Status', 'Guest', 'Check-in', 'Check-out'],
      showTotal:    false,
      isBill:       false,
      filters: [
        { key: 'roomNumber', label: 'Room No.', type: 'text' },
        { key: 'roomType', label: 'Type', type: 'select', options: ['Single', 'Double', 'Suite', 'Deluxe'] },
        { key: 'status', label: 'Status', type: 'select', options: ['Available', 'Booked', 'Maintenance'] },
        { key: 'guest', label: 'Guest', type: 'text' },
      ],
    },
    {
      key:         'guest-list',
      label:       'Guest List',
      apiPath:     '/api/reports/guest-list',
      description: 'All registered guests with booking history and spending',
      columns: ['Full Name', 'Phone', 'Email', 'ID No.', 'Bookings', 'Total Spent'],
      showTotal:    true,
      isBill:       false,
      filters: [
        { key: 'fullName', label: 'Full Name', type: 'text' },
        { key: 'phone', label: 'Phone', type: 'text' },
        { key: 'email', label: 'Email', type: 'text' },
      ],
    },
    {
      key:         'booking-summary',
      label:       'Booking Summary',
      apiPath:     '/api/reports/booking-summary',
      description: 'Summary of all bookings with guest, room, dates, and status',
      columns: ['Booking No.', 'Guest', 'Room', 'Check-in', 'Check-out', 'Amount', 'Status'],
      showTotal:    true,
      isBill:       false,
      filters: [
        { key: 'bookingNumber', label: 'Booking No.', type: 'text' },
        { key: 'guest', label: 'Guest', type: 'text' },
        { key: 'room', label: 'Room', type: 'text' },
        { key: 'status', label: 'Status', type: 'select', options: ['Confirmed', 'Checked-in', 'Checked-out', 'Cancelled'] },
        { key: 'checkInDate', label: 'Check-in Date', type: 'date' },
      ],
    },
    {
      key:         'payment-ledger',
      label:       'Payment Ledger',
      apiPath:     '/api/reports/payment-ledger',
      description: 'All payments recorded with booking and method details',
      columns: ['Payment No.', 'Booking', 'Guest', 'Amount', 'Method', 'Date'],
      showTotal:    true,
      isBill:       false,
      filters: [
        { key: 'paymentNumber', label: 'Payment No.', type: 'text' },
        { key: 'booking', label: 'Booking', type: 'text' },
        { key: 'guest', label: 'Guest', type: 'text' },
        { key: 'paymentMethod', label: 'Method', type: 'select', options: ['Cash', 'Card', 'Mobile Money'] },
        { key: 'paymentDate', label: 'Date', type: 'date' },
      ],
    },
    {
      key:         'guest-statement',
      label:       'Guest Statement',
      apiPath:     '/api/reports/guest-statement',
      description: 'Generate a statement for a guest showing all bookings and payments',
      filter: { type: 'select-api', source: '/api/guests', labelKey: 'fullName', param: 'guestId', label: 'Select Guest' },
      columns: ['Booking No.', 'Room', 'Check-in', 'Check-out', 'Amount', 'Paid', 'Balance'],
      showTotal:    true,
      isBill:       true,
      filters: [
        { key: 'bookingNumber', label: 'Booking No.', type: 'text' },
        { key: 'room', label: 'Room', type: 'text' },
        { key: 'status', label: 'Status', type: 'select', options: ['Confirmed', 'Checked-in', 'Checked-out', 'Cancelled'] },
        { key: 'checkInDate', label: 'Check-in Date', type: 'date' },
      ],
    },
    {
      key:         'daily',
      label:       'Daily Revenue',
      apiPath:     '/api/reports/daily-revenue',
      description: 'Revenue collected per day including booking and payment details',
      filter: { type: 'date', param: 'date', label: 'Select Date' },
      columns: ['Booking No.', 'Guest', 'Room', 'Amount', 'Payment Method'],
      showTotal:    true,
      isBill:       false,
      filters: [
        { key: 'bookingNumber', label: 'Booking No.', type: 'text' },
        { key: 'guest', label: 'Guest', type: 'text' },
        { key: 'room', label: 'Room', type: 'text' },
        { key: 'paymentMethod', label: 'Payment Method', type: 'select', options: ['Cash', 'Card', 'Mobile Money'] },
      ],
    },
  ],

  // ── 9. DASHBOARD STATS ──────────────────────────────────────
  stats: [
    { label: 'Available Rooms',  apiPath: '/api/stats/available-rooms',  icon: 'building', color: 'primary' },
    { label: 'Checked-in',       apiPath: '/api/stats/checked-in-guests', icon: 'users',    color: 'green'   },
    { label: 'Today Revenue',    apiPath: '/api/stats/revenue-today',     icon: 'payment',  color: 'orange'  },
    { label: 'Total Bookings',   apiPath: '/api/stats/total-bookings',    icon: 'clipboard',color: 'purple'  },
  ],

}

export default config


