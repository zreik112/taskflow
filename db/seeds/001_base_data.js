const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Deterministic UUIDs for reproducibility
const IDS = {
  orgs: {
    acme: 'a0000000-0000-4000-8000-000000000001',
    beirut: 'b0000000-0000-4000-8000-000000000002',
  },
  users: {
    acmeAdmin: 'u0000000-0000-4000-8000-000000000001',
    acmeMember1: 'u0000000-0000-4000-8000-000000000002',
    acmeMember2: 'u0000000-0000-4000-8000-000000000003',
    beirutAdmin: 'u0000000-0000-4000-8000-000000000004',
    beirutMember: 'u0000000-0000-4000-8000-000000000005',
  },
  projects: {
    acmeStrategy: 'p0000000-0000-4000-8000-000000000001',
    acmeDigital: 'p0000000-0000-4000-8000-000000000002',
    beirutTower: 'p0000000-0000-4000-8000-000000000003',
    beirutBridge: 'p0000000-0000-4000-8000-000000000004',
  },
};

const now = new Date();
const inDays = (n) => new Date(now.getTime() + n * 86400000);

/**
 * @param { import("knex").Knex } knex
 */
exports.seed = async function (knex) {
  // Truncate in dependency order (tasks first to respect FKs)
  await knex('tasks').del();
  await knex('projects').del();
  await knex('users').del();
  await knex('organizations').del();

  // Single bcrypt hash reused for all users (Checkpoint1!)
  const passwordHash = await bcrypt.hash('Checkpoint1!', 10);

  // ── Organizations ──────────────────────────────────────────────
  await knex('organizations').insert([
    {
      id: IDS.orgs.acme,
      name: 'Acme Consulting',
      slug: 'acme',
    },
    {
      id: IDS.orgs.beirut,
      name: 'Beirut Builders',
      slug: 'beirut-builders',
    },
  ]);

  // ── Users ──────────────────────────────────────────────────────
  await knex('users').insert([
    // Acme Consulting — 3 users
    {
      id: IDS.users.acmeAdmin,
      organization_id: IDS.orgs.acme,
      email: 'lina@acme.example',
      first_name: 'Lina',
      last_name: 'Haddad',
      password_hash: passwordHash,
      role: 'admin',
    },
    {
      id: IDS.users.acmeMember1,
      organization_id: IDS.orgs.acme,
      email: 'karim@acme.example',
      first_name: 'Karim',
      last_name: 'Mansour',
      password_hash: passwordHash,
      role: 'member',
    },
    {
      id: IDS.users.acmeMember2,
      organization_id: IDS.orgs.acme,
      email: 'sara@acme.example',
      first_name: 'Sara',
      last_name: 'Khalil',
      password_hash: passwordHash,
      role: 'member',
    },
    // Beirut Builders — 2 users
    {
      id: IDS.users.beirutAdmin,
      organization_id: IDS.orgs.beirut,
      email: 'rania@beirutbuilders.example',
      first_name: 'Rania',
      last_name: 'Saleh',
      password_hash: passwordHash,
      role: 'admin',
    },
    {
      id: IDS.users.beirutMember,
      organization_id: IDS.orgs.beirut,
      email: 'tarek@beirutbuilders.example',
      first_name: 'Tarek',
      last_name: 'Nassar',
      password_hash: passwordHash,
      role: 'member',
    },
  ]);

  // ── Projects ───────────────────────────────────────────────────
  await knex('projects').insert([
    {
      id: IDS.projects.acmeStrategy,
      organization_id: IDS.orgs.acme,
      name: 'Digital Transformation Strategy',
      description: 'Advisory engagement to define the 3-year digital roadmap.',
      status: 'active',
      owner_id: IDS.users.acmeAdmin,
    },
    {
      id: IDS.projects.acmeDigital,
      organization_id: IDS.orgs.acme,
      name: 'Customer Analytics Platform',
      description: 'Build and deploy a unified customer data platform.',
      status: 'active',
      owner_id: IDS.users.acmeMember1,
    },
    {
      id: IDS.projects.beirutTower,
      organization_id: IDS.orgs.beirut,
      name: 'Verdun Tower Renovation',
      description: 'Structural assessment and façade renovation of the 14-floor tower.',
      status: 'active',
      owner_id: IDS.users.beirutAdmin,
    },
    {
      id: IDS.projects.beirutBridge,
      organization_id: IDS.orgs.beirut,
      name: 'Antelias Highway Bridge',
      description: 'New pedestrian overpass — design, permits, and construction.',
      status: 'active',
      owner_id: IDS.users.beirutMember,
    },
  ]);

  // ── Tasks ──────────────────────────────────────────────────────
  // 20 tasks: ~40% todo, ~35% in_progress, ~25% done
  // ~70% assigned, ~30% unassigned
  await knex('tasks').insert([
    // Acme — Digital Transformation Strategy (8 tasks)
    {
      id: uuidv4(),
      organization_id: IDS.orgs.acme,
      project_id: IDS.projects.acmeStrategy,
      title: 'Conduct stakeholder interviews (C-suite)',
      description: 'Schedule and run 60-min interviews with CFO, CTO, and COO.',
      status: 'done',
      priority: 'high',
      assigned_to: IDS.users.acmeAdmin,
      due_date: inDays(-5),
      created_by: IDS.users.acmeAdmin,
    },
    {
      id: uuidv4(),
      organization_id: IDS.orgs.acme,
      project_id: IDS.projects.acmeStrategy,
      title: 'Benchmark competitor digital maturity',
      description: 'Analyze top 5 competitors using Gartner maturity model.',
      status: 'done',
      priority: 'medium',
      assigned_to: IDS.users.acmeMember1,
      due_date: inDays(-2),
      created_by: IDS.users.acmeAdmin,
    },
    {
      id: uuidv4(),
      organization_id: IDS.orgs.acme,
      project_id: IDS.projects.acmeStrategy,
      title: 'Draft digital maturity assessment report',
      description: null,
      status: 'in_progress',
      priority: 'high',
      assigned_to: IDS.users.acmeMember2,
      due_date: inDays(3),
      created_by: IDS.users.acmeAdmin,
    },
    {
      id: uuidv4(),
      organization_id: IDS.orgs.acme,
      project_id: IDS.projects.acmeStrategy,
      title: 'Define 5 strategic pillars for transformation',
      description: 'Workshop output — identify pillars and prioritize with leadership.',
      status: 'in_progress',
      priority: 'high',
      assigned_to: IDS.users.acmeAdmin,
      due_date: inDays(7),
      created_by: IDS.users.acmeAdmin,
    },
    {
      id: uuidv4(),
      organization_id: IDS.orgs.acme,
      project_id: IDS.projects.acmeStrategy,
      title: 'Map current-state IT architecture',
      description: null,
      status: 'todo',
      priority: 'medium',
      assigned_to: IDS.users.acmeMember1,
      due_date: inDays(10),
      created_by: IDS.users.acmeMember1,
    },
    {
      id: uuidv4(),
      organization_id: IDS.orgs.acme,
      project_id: IDS.projects.acmeStrategy,
      title: 'Prepare board presentation deck',
      description: 'Executive summary + 10-slide deck for board sign-off.',
      status: 'todo',
      priority: 'high',
      assigned_to: IDS.users.acmeAdmin,
      due_date: inDays(14),
      created_by: IDS.users.acmeAdmin,
    },
    {
      id: uuidv4(),
      organization_id: IDS.orgs.acme,
      project_id: IDS.projects.acmeStrategy,
      title: 'Identify quick-win automation candidates',
      description: null,
      status: 'todo',
      priority: 'low',
      assigned_to: null,
      due_date: null,
      created_by: IDS.users.acmeMember2,
    },
    {
      id: uuidv4(),
      organization_id: IDS.orgs.acme,
      project_id: IDS.projects.acmeStrategy,
      title: 'Review and sign client NDA addendum',
      description: null,
      status: 'todo',
      priority: 'medium',
      assigned_to: null,
      due_date: inDays(2),
      created_by: IDS.users.acmeAdmin,
    },

    // Acme — Customer Analytics Platform (4 tasks)
    {
      id: uuidv4(),
      organization_id: IDS.orgs.acme,
      project_id: IDS.projects.acmeDigital,
      title: 'Define KPIs for customer 360 dashboard',
      description: 'Align with sales and marketing on 8 core KPIs.',
      status: 'done',
      priority: 'high',
      assigned_to: IDS.users.acmeMember1,
      due_date: inDays(-10),
      created_by: IDS.users.acmeMember1,
    },
    {
      id: uuidv4(),
      organization_id: IDS.orgs.acme,
      project_id: IDS.projects.acmeDigital,
      title: 'Set up data ingestion pipeline from CRM',
      description: 'Salesforce → S3 → Redshift pipeline using Fivetran.',
      status: 'in_progress',
      priority: 'high',
      assigned_to: IDS.users.acmeMember2,
      due_date: inDays(5),
      created_by: IDS.users.acmeMember1,
    },
    {
      id: uuidv4(),
      organization_id: IDS.orgs.acme,
      project_id: IDS.projects.acmeDigital,
      title: 'Write data quality validation rules',
      description: null,
      status: 'todo',
      priority: 'medium',
      assigned_to: IDS.users.acmeMember1,
      due_date: inDays(8),
      created_by: IDS.users.acmeMember1,
    },
    {
      id: uuidv4(),
      organization_id: IDS.orgs.acme,
      project_id: IDS.projects.acmeDigital,
      title: 'Design dashboard wireframes',
      description: null,
      status: 'todo',
      priority: 'low',
      assigned_to: null,
      due_date: null,
      created_by: IDS.users.acmeMember2,
    },

    // Beirut Builders — Verdun Tower Renovation (5 tasks)
    {
      id: uuidv4(),
      organization_id: IDS.orgs.beirut,
      project_id: IDS.projects.beirutTower,
      title: 'Complete structural engineering assessment',
      description: 'Third-party structural audit required before permit application.',
      status: 'done',
      priority: 'high',
      assigned_to: IDS.users.beirutAdmin,
      due_date: inDays(-7),
      created_by: IDS.users.beirutAdmin,
    },
    {
      id: uuidv4(),
      organization_id: IDS.orgs.beirut,
      project_id: IDS.projects.beirutTower,
      title: 'Submit façade renovation permit to municipality',
      description: null,
      status: 'in_progress',
      priority: 'high',
      assigned_to: IDS.users.beirutMember,
      due_date: inDays(4),
      created_by: IDS.users.beirutAdmin,
    },
    {
      id: uuidv4(),
      organization_id: IDS.orgs.beirut,
      project_id: IDS.projects.beirutTower,
      title: 'Select cladding material and supplier',
      description: 'Compare 3 suppliers on cost, lead time, and thermal performance.',
      status: 'todo',
      priority: 'medium',
      assigned_to: IDS.users.beirutAdmin,
      due_date: inDays(9),
      created_by: IDS.users.beirutAdmin,
    },
    {
      id: uuidv4(),
      organization_id: IDS.orgs.beirut,
      project_id: IDS.projects.beirutTower,
      title: 'Mobilize scaffolding team',
      description: null,
      status: 'todo',
      priority: 'medium',
      assigned_to: null,
      due_date: inDays(12),
      created_by: IDS.users.beirutMember,
    },
    {
      id: uuidv4(),
      organization_id: IDS.orgs.beirut,
      project_id: IDS.projects.beirutTower,
      title: 'Prepare tenant communication about noise schedule',
      description: null,
      status: 'todo',
      priority: 'low',
      assigned_to: IDS.users.beirutMember,
      due_date: inDays(6),
      created_by: IDS.users.beirutAdmin,
    },

    // Beirut Builders — Antelias Highway Bridge (3 tasks)
    {
      id: uuidv4(),
      organization_id: IDS.orgs.beirut,
      project_id: IDS.projects.beirutBridge,
      title: 'Finalize geotechnical survey report',
      description: 'Soil bearing capacity and groundwater level analysis.',
      status: 'in_progress',
      priority: 'high',
      assigned_to: IDS.users.beirutMember,
      due_date: inDays(3),
      created_by: IDS.users.beirutMember,
    },
    {
      id: uuidv4(),
      organization_id: IDS.orgs.beirut,
      project_id: IDS.projects.beirutBridge,
      title: 'Draft bridge conceptual design — 3 options',
      description: null,
      status: 'todo',
      priority: 'high',
      assigned_to: IDS.users.beirutAdmin,
      due_date: inDays(11),
      created_by: IDS.users.beirutMember,
    },
    {
      id: uuidv4(),
      organization_id: IDS.orgs.beirut,
      project_id: IDS.projects.beirutBridge,
      title: 'Coordinate with Ministry of Public Works for permit',
      description: null,
      status: 'todo',
      priority: 'medium',
      assigned_to: null,
      due_date: null,
      created_by: IDS.users.beirutAdmin,
    },
  ]);
};
