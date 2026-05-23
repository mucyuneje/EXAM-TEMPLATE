  const config = {

    // ── 1. APP INFO ─────────────────────────────────────────────
    appName:    'SmartPark',
    appSubtitle:'Car Washing Sales Management System',
    dbName:     'CWSMS',

    // ── 2. LAYOUT ───────────────────────────────────────────────
    layout: 'sidebar-left',

    // ── 3. COLOR THEME ──────────────────────────────────────────
    color: 'green',

    // ── 4. COLOR MODE ───────────────────────────────────────────
    defaultMode: 'light',

    // ── 5. BACKEND CONFIG ───────────────────────────────────────
    apiConfig: {
      type:    'rest',
      baseURL: 'http://localhost:5000',
      authType: 'jwt',
      loginEndpoint:    '/api/auth/login',
      registerEndpoint: '/api/auth/register',
      recoverEndpoint:  '/api/auth/recover',
      securityQuestionEndpoint: '/api/auth/security-question',
    },

    // ── LOCALISATION ─────────────────────────────────────────────
    currency: 'Rwf',
    locale:   'en-RW',

    // ── 6. SECURITY QUESTIONS ───────────────────────────────────
    securityQuestions: [
      "What was the name of your first pet?",
      "What is your mother's maiden name?",
      "What city were you born in?",
      "What was the name of your primary school?",
      "What is the name of the street you grew up on?",
      "What was your childhood nickname?",
    ],

    // ── 7. NAV LINKS ────────────────────────────────────────────
    navLinks: [
      { label: 'Dashboard',    path: '/dashboard',          icon: 'dashboard' },
      { label: 'Packages',     path: '/packages',           icon: 'settings' },
      { label: 'Cars',         path: '/cars',               icon: 'car' },
      { label: 'Wash Records', path: '/service-packages',   icon: 'clipboard' },
      { label: 'Payments',     path: '/payments',           icon: 'payment' },
      { label: 'Reports',      path: '/reports',            icon: 'chart' },
    ],

    // ── 8. PAGES (tables + forms) ───────────────────────────────
    // Field types: 'text' | 'number' | 'date' | 'email' | 'tel'
    //              'select-static'  (options: ['A','B'])
    //              'select-api'     (source: '/api/items', labelKey: 'name')
    //              'textarea'
    //              'readonly'       (auto-calculated, shown but not submitted)
    //              'auto'           (hidden in form, backend generates the value)

    pages: {

      packages: {
        label:   'Packages',
        apiPath: '/api/packages',
        ops:     ['update', 'delete'],
        fields: [
          { name: 'Package No.',    key: 'packageNumber',    type: 'auto' },
          { name: 'Package Name',   key: 'packageName',      type: 'text',   required: true },
          { name: 'Description',    key: 'packageDescription', type: 'textarea' },
          { name: 'Package Price',  key: 'packagePrice',     type: 'number', required: true },
        ],
        tableColumns: [
          { key: 'packageNumber',  label: 'Code' },
          { key: 'packageName',    label: 'Package' },
          { key: 'packageDescription', label: 'Description' },
          { key: 'packagePrice',   label: 'Price', format: 'number' },
        ],
      },

      cars: {
        label:   'Cars',
        apiPath: '/api/cars',
        ops:     ['update', 'delete'],
        fields: [
          { name: 'Plate Number',  key: 'plateNumber', type: 'text',   required: true },
          { name: 'Car Type',      key: 'carType',     type: 'select-static', options: ['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Minibus', 'Truck', 'Other'], required: true },
          { name: 'Car Size',      key: 'carSize',     type: 'select-static', options: ['Small', 'Medium', 'Large'], required: true },
          { name: 'Driver Name',   key: 'driverName',  type: 'text',   required: true },
          { name: 'Phone Number',  key: 'phoneNumber', type: 'tel',    required: true },
        ],
        tableColumns: [
          { key: 'plateNumber', label: 'Plate' },
          { key: 'carType',     label: 'Type' },
          { key: 'carSize',     label: 'Size' },
          { key: 'driverName',  label: 'Driver' },
          { key: 'phoneNumber', label: 'Phone' },
        ],
      },

      'service-packages': {
        label:   'Wash Records',
        apiPath: '/api/service-packages',
        ops:     ['update', 'delete'],
        fields: [
          { name: 'Record No.',   key: 'recordNumber',               type: 'auto' },
          { name: 'Car',          key: 'carId',                       type: 'select-api', source: '/api/cars',            labelKey: 'plateNumber', required: true },
          { name: 'Wash Package', key: 'packageId',                   type: 'select-api', source: '/api/packages',        labelKey: 'packageName', required: true },
          { name: 'Wash Date',    key: 'serviceDate',                 type: 'date', required: true },
        ],
        tableColumns: [
          { key: 'recordNumber',              label: 'Record No.' },
          { key: 'carId.plateNumber',         label: 'Plate' },
          { key: 'carId.driverName',          label: 'Driver' },
          { key: 'packageId.packageName',     label: 'Package' },
          { key: 'packageId.packagePrice',    label: 'Price', format: 'number' },
          { key: 'serviceDate',               label: 'Date', format: 'date' },
        ],
      },

      payments: {
        label:   'Payments',
        apiPath: '/api/payments',
        ops:     ['update', 'delete'],
        fields: [
          { name: 'Payment No.',    key: 'paymentNumber', type: 'auto' },
          { name: 'Wash Record',    key: 'recordId',      type: 'select-api', source: '/api/service-packages', labelKey: 'recordNumber', optionLabel: (r) => `#${r.recordNumber} ${r.carId?.plateNumber || ''} ${r.packageId?.packageName || ''}`, required: true },
          { name: 'Amount Paid',    key: 'amountPaid',    type: 'number', required: true, autoFill: { watch: 'recordId', from: 'packageId.packagePrice' } },
          { name: 'Payment Date',   key: 'paymentDate',   type: 'date',   required: true },
        ],
        tableColumns: [
          { key: 'paymentNumber',                 label: 'Payment No.' },
          { key: 'recordId.recordNumber',          label: 'Record' },
          { key: 'recordId.carId.plateNumber',      label: 'Plate' },
          { key: 'recordId.packageId.packageName',   label: 'Package' },
          { key: 'amountPaid',                    label: 'Amount', format: 'number' },
          { key: 'paymentDate',                   label: 'Date',   format: 'date' },
        ],
      },

    },

    // ── 9. REPORTS ──────────────────────────────────────────────
    reports: [
      {
        key:         'service-records',
        label:       'Wash Records',
        apiPath:     '/api/reports/service-records',
        description: 'All car wash records with car and package details',
        columns: ['Record No.', 'Plate', 'Car Type', 'Driver', 'Package', 'Price', 'Date'],
        showTotal:    false,
        isBill:       false,
        filters: [
          { key: 'recordNumber', label: 'Record No.', type: 'text' },
          { key: 'plateNumber',  label: 'Plate', type: 'text' },
          { key: 'driverName',   label: 'Driver', type: 'text' },
        ],
      },
      {
        key:         'car-list',
        label:       'Car List',
        apiPath:     '/api/reports/car-list',
        description: 'All registered cars with wash history and total spending',
        columns: ['Plate', 'Type', 'Size', 'Driver', 'Phone', 'Washes', 'Total Spent'],
        showTotal:    true,
        isBill:       false,
        filters: [
          { key: 'plateNumber', label: 'Plate', type: 'text' },
          { key: 'carType',     label: 'Type', type: 'text' },
          { key: 'driverName',  label: 'Driver', type: 'text' },
        ],
      },
      {
        key:         'payment-summary',
        label:       'Payment Summary',
        apiPath:     '/api/reports/payment-summary',
        description: 'All payments recorded with car and package details',
        columns: ['Payment No.', 'Record', 'Plate', 'Package', 'Amount', 'Date'],
        showTotal:    true,
        isBill:       false,
        filters: [
          { key: 'paymentNumber', label: 'Payment No.', type: 'text' },
          { key: 'recordNumber',  label: 'Record', type: 'text' },
          { key: 'plateNumber',   label: 'Plate', type: 'text' },
        ],
      },
      {
        key:         'daily',
        label:       'Daily Revenue',
        apiPath:     '/api/reports/daily-revenue',
        description: 'Revenue collected per day including payment details',
        filter: { type: 'date', param: 'date', label: 'Select Date' },
        columns: ['Payment No.', 'Record', 'Plate', 'Amount'],
        showTotal:    true,
        isBill:       false,
        filters: [
          { key: 'paymentNumber', label: 'Payment No.', type: 'text' },
          { key: 'recordNumber',  label: 'Record', type: 'text' },
          { key: 'plateNumber',   label: 'Plate', type: 'text' },
        ],
      },
    ],

    // ── 10. DASHBOARD STATS ─────────────────────────────────────
    stats: [
      { label: 'Total Cars',        apiPath: '/api/stats/total-cars',        icon: 'car',     color: 'primary' },
      { label: 'Today Washes',      apiPath: '/api/stats/active-packages',   icon: 'settings', color: 'orange' },
      { label: 'Today Revenue',     apiPath: '/api/stats/revenue-today',     icon: 'payment',  color: 'green' },
      { label: 'Total Revenue',     apiPath: '/api/stats/total-revenue',     icon: 'chart',    color: 'purple' },
    ],

  }

  export default config
