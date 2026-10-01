export interface ProjectTask { id: string; title: string; detail: string; output: string }
export interface LearningProject { id: string; title: string; subtitle: string; status: string; technologies: string[]; description: string; architecture: string[]; tasks: ProjectTask[] }

export const projects: LearningProject[] = [
  {
    id: 'classic-monitor', title: 'Classic ABAP Order Monitor', subtitle: 'Sales / purchase order report', status: 'Milestone: Month 2', technologies: ['Open SQL', 'DDIC', 'Internal tables', 'ALV', 'ABAP OO'],
    description: 'Build a practical monitoring report that helps an operations user find delayed or incomplete orders. The exercise runs from requirement clarification through design, implementation, debugging, test evidence, and demo.',
    architecture: ['Selection criteria and validation', 'Focused Open SQL data access', 'Typed result model and business calculations', 'ALV presentation and navigation', 'Test notes, performance evidence, and demo'],
    tasks: [
      { id: 'requirement', title: 'Clarify the requirement', detail: 'Define users, document scope, status meanings, date rules, required columns, and expected row volume.', output: 'A one-page functional summary and open-question log.' },
      { id: 'business-flow', title: 'Map the business flow', detail: 'Choose procurement or sales and map the relevant document relationship from business event to report row.', output: 'A simple document-flow diagram with key identifiers.' },
      { id: 'technical-design', title: 'Write the technical design', detail: 'Describe input validation, sources, joins, output fields, derived values, authorizations, and error behavior.', output: 'An English technical specification with field mapping.' },
      { id: 'ddic', title: 'Define the data model', detail: 'Identify keys, data elements, amount/currency semantics, status values, and suitable reusable types.', output: 'A reviewed field model and DDIC object list.' },
      { id: 'query', title: 'Implement focused Open SQL', detail: 'Use explicit columns, restrictive predicates, joins where appropriate, and documented release-compatible syntax.', output: 'A query tested for empty and representative data sets.' },
      { id: 'internal-tables', title: 'Shape and calculate results', detail: 'Use a typed internal table and a suitable key. Keep business calculations independent from display formatting.', output: 'A deterministic result set and explanation of lookup strategy.' },
      { id: 'oo', title: 'Separate responsibilities with OO ABAP', detail: 'Keep report orchestration, data retrieval, and business calculation responsibilities understandable.', output: 'A small class design and one testable calculation method.' },
      { id: 'alv', title: 'Present an operational ALV', detail: 'Label columns, preserve keys, show amount currency correctly, and choose useful sort/filter behavior.', output: 'A user-reviewed ALV layout or documented equivalent for the target release.' },
      { id: 'errors', title: 'Handle errors and edge cases', detail: 'Handle invalid ranges, no results, unexpected statuses, and dependency errors with useful messages.', output: 'An edge-case table with user-facing outcomes.' },
      { id: 'debug', title: 'Debug a seeded defect', detail: 'Reproduce a wrong total or status, inspect variables and internal tables, and record the first divergence.', output: 'A root-cause note and verified correction.' },
      { id: 'performance', title: 'Check performance behavior', detail: 'Measure query count, transferred rows, and runtime on representative volume; avoid SELECT in loops.', output: 'A before/after observation with system and data assumptions.' },
      { id: 'test-cases', title: 'Write and run test cases', detail: 'Cover the happy path, empty result, boundaries, invalid input, and any authorization expectation.', output: 'English test cases with expected and actual results.' },
      { id: 'docs', title: 'Document the implementation', detail: 'Capture architecture, setup, decisions, test evidence, limits, and how to run or review the report.', output: 'A project README and technical notes.' },
      { id: 'demo', title: 'Rehearse the project demo', detail: 'Present the user need, one realistic run, the design, a test, and one trade-off in five minutes.', output: 'A timed English demo outline and reproducible scenario.' },
    ],
  },
  {
    id: 'modern-app', title: 'Modern S/4HANA Request App', subtitle: 'CDS → RAP → OData → Fiori Elements', status: 'Milestone: Months 4–5', technologies: ['CDS view entities', 'RAP', 'OData', 'Fiori Elements', 'ABAP Cloud'],
    description: 'Create a small request-management business object with list and detail access, controlled changes, validation, authorization, and a metadata-driven UI. The model is a learning design; deployability depends on your ABAP environment and release.',
    architecture: ['CDS interface/root and child entities', 'RAP behavior with validation, determination, and action', 'Projection and service definition', 'Service binding using a supported OData protocol', 'Fiori Elements List Report and Object Page'],
    tasks: [
      { id: 'scope', title: 'Define the request lifecycle', detail: 'Name the user roles, state transitions, required fields, and boundaries of the learning app.', output: 'A concise user story and acceptance criteria.' },
      { id: 'model', title: 'Model root and child entities', detail: 'Choose keys, fields, composition, associations, and amount/unit semantics for the request.', output: 'A CDS model sketch with explicit cardinalities.' },
      { id: 'cds', title: 'Build CDS entities', detail: 'Create the persistence and interface model, then add clear labels and only justified annotations.', output: 'Activated entities with a data preview.' },
      { id: 'authorization', title: 'Define access rules', detail: 'State which role may display or change each request and which company/owner scope applies.', output: 'An authorization design and allowed/denied test matrix.' },
      { id: 'managed', title: 'Implement managed RAP behavior', detail: 'Enable only the needed standard operations and specify the behavior implementation model.', output: 'A behavior definition with documented framework responsibilities.' },
      { id: 'validation', title: 'Add validation and determination', detail: 'Reject an invalid requested date and derive a display/status value from valid state.', output: 'Behavior logic and positive/negative tests.' },
      { id: 'action', title: 'Add a business action', detail: 'Add a meaningful action such as submit or approve, with state checks and a clear result.', output: 'An action scenario with allowed and rejected transitions.' },
      { id: 'projection', title: 'Create a service projection', detail: 'Expose only the entities and operations required by the UI or API consumer.', output: 'A projection layer with a documented public surface.' },
      { id: 'odata', title: 'Bind and inspect the OData service', detail: 'Choose a supported binding type in the target system, publish it, inspect metadata, and try CRUD safely.', output: 'A successful service preview and metadata note.' },
      { id: 'fiori', title: 'Configure a Fiori Elements experience', detail: 'Set up useful list columns, filters, object-page sections, and navigation using supported annotations.', output: 'A task-focused List Report/Object Page demo.' },
      { id: 'tests', title: 'Test security and lifecycle rules', detail: 'Test CRUD, state changes, validation errors, role restrictions, and an end-to-end read/update path.', output: 'Test evidence with expected/actual results and identity details.' },
      { id: 'clean-core', title: 'Review Clean Core choices', detail: 'Check every dependency for the target language version and API release contract; explain extension choices.', output: 'An API and extensibility decision record.' },
      { id: 'performance', title: 'Review query behavior', detail: 'Check fields, filters, associations, and representative query volume in the target environment.', output: 'A query review with measured or explicitly unverified areas.' },
      { id: 'portfolio', title: 'Package the portfolio project', detail: 'Prepare architecture, prerequisites, build steps, tests, release constraints, and a 10-minute English walkthrough.', output: 'A polished README, demo flow, and evidence folder.' },
    ],
  },
]

export const englishTracks = [
  { id: 'daily', title: 'Daily meeting updates', tag: 'Stand-up', lesson: 'Use past work, today’s focus, and a specific blocker in three short sentences.', phrases: ['Yesterday I worked on the purchase-order query.', 'Today I will test the empty-result and authorization cases.', 'I am currently blocked because the service binding is not available in this tenant.'] },
  { id: 'clarify', title: 'Clarifying a requirement', tag: 'Discovery', lesson: 'Ask one focused question, state why the answer changes implementation, then confirm your understanding.', phrases: ['Could you clarify which date should determine whether an order is overdue?', 'Should this field be mandatory for every request status?', 'I understand that only the requester’s company code should be visible. Is that correct?'] },
  { id: 'technical', title: 'Explaining a technical issue', tag: 'Engineering', lesson: 'Give the reproducible symptom and evidence before proposing a root cause.', phrases: ['The issue occurs when the result contains duplicate item keys.', 'I reproduced the symptom with order 450001 and two matching item rows.', 'The first incorrect value appears after the aggregation step.'] },
  { id: 'testing', title: 'Reporting a test result', tag: 'QA', lesson: 'Keep expected and actual results separate and finish with the observed status.', phrases: ['The expected result is that unauthorized orders are hidden by the service.', 'The actual result includes a row from company code 2000.', 'The test failed. I have attached the request and response for review.'] },
  { id: 'code-review', title: 'Taking part in code review', tag: 'Review', lesson: 'Explain intent, trade-offs, and evidence without becoming defensive.', phrases: ['I changed this logic because it was reading each item inside the header loop.', 'The new query returns the same totals in the test cases.', 'Would you prefer a named helper method here for readability?'] },
  { id: 'incident', title: 'Incident update', tag: 'Support', lesson: 'Separate impact, confirmed cause, mitigation, and next update time.', phrases: ['The report currently returns incomplete results for one supplier.', 'I have not confirmed the root cause yet; I am checking the filter and authorization path.', 'The temporary workaround is to run the report without the optional status filter.'] },
  { id: 'documentation', title: 'Technical Specification vocabulary', tag: 'Writing', lesson: 'Use concrete terms for inputs, mappings, validations, dependencies, and test outcomes.', phrases: ['The service exposes the request root entity and its item association.', 'The validation rejects a requested date earlier than the creation date.', 'The API dependency must be released for the target ABAP language version.'] },
  { id: 'interview', title: 'Technical interview practice', tag: 'Interview', lesson: 'Answer with a definition, a project example, and a trade-off or verification step.', phrases: ['I used a hashed table because the report performs repeated unique-key lookups.', 'I would verify the API release contract in the target system before using it.', 'In my learning project, I tested the authorization rule with allowed and denied roles.'] },
]

export const certificationDomains = [
  { id: 'language', title: 'ABAP language and development tools', detail: 'Core syntax, ABAP development tools, source organization, and release-aware language features.' },
  { id: 'data', title: 'Data modeling and access', detail: 'ABAP Dictionary, Open SQL, CDS entities, associations, and authorization-aware data access.' },
  { id: 'rap', title: 'RAP business objects and services', detail: 'Behavior, managed scenarios, services, OData, and application development flow.' },
  { id: 'cloud', title: 'ABAP Cloud and extensibility', detail: 'Language versions, released APIs, extension choices, and Clean Core reasoning.' },
  { id: 'quality', title: 'Testing and quality', detail: 'ABAP Unit concepts, debugging, code checks, and performance reasoning.' },
]

export const interviewQuestions = [
  { category: 'ABAP fundamentals', question: 'What is the difference between a structure and an internal table?', tests: 'Typed row shape versus an in-memory collection of rows.', answer: 'A structure describes one row with named components. An internal table stores zero or more rows of a line type and can define keys for access.' },
  { category: 'Open SQL', question: 'Why should you avoid SELECT inside a loop?', tests: 'Database round trips and set-based access.', answer: 'Repeated selects can create many database requests. I would usually select related data together with a join or set-based query, then measure representative input. A loop may still be justified at a specific boundary.' },
  { category: 'Internal tables', question: 'When might you choose a hashed table?', tests: 'Key-based lookup behavior and trade-offs.', answer: 'When a unique key is central and I need frequent exact-key access. I would confirm uniqueness and memory cost; sorted tables suit ordered access, while standard tables can fit sequential work.' },
  { category: 'OO ABAP', question: 'How do interfaces help an ABAP design?', tests: 'Contracts, modularity, and substitutable implementations.', answer: 'An interface describes the operations a caller needs without coupling it to a concrete class. That supports focused dependencies and test doubles.' },
  { category: 'Debugging', question: 'How do you investigate a wrong calculated value?', tests: 'Evidence-led debugging.', answer: 'I reproduce it with known input, place a breakpoint before the calculation, inspect the inputs and table keys, step through the state changes, and identify the first divergence before changing code.' },
  { category: 'CDS', question: 'What is the difference between an association and a join?', tests: 'Data modeling concepts.', answer: 'A join combines rows in a query. A CDS association models a relationship that consumers can navigate and can be used to define joins when needed.' },
  { category: 'RAP', question: 'What does a RAP behavior definition describe?', tests: 'Transactional capabilities and business rules.', answer: 'It declares the operations and behavior of a business object, such as create/update/delete, validations, determinations, and actions, depending on the scenario.' },
  { category: 'S/4HANA', question: 'How would you learn an unfamiliar business document flow?', tests: 'Ability to connect code to business behavior.', answer: 'I would confirm the user’s process and document identifiers, trace a sample through the system, inspect official documentation and data relationships, then validate assumptions with a functional teammate.' },
  { category: 'Clean Core', question: 'Why check whether an API is released?', tests: 'Upgrade safety and ABAP Cloud constraints.', answer: 'The release contract indicates supported use in a development context. I would verify it in the target system and choose a supported extension point instead of depending on an internal implementation.' },
  { category: 'Project discussion', question: 'What would you improve in your order-monitoring report?', tests: 'Ownership, prioritization, and reflection.', answer: 'I would identify the biggest verified user or quality gap first. For example, I would add a measured query improvement or broader authorization tests, explain the evidence, and avoid claiming a change is needed without confirming usage.' },
  { category: 'Behavioral', question: 'Tell me about a time you were blocked.', tests: 'Communication and ownership.', answer: 'I would describe the goal, what I tried, the evidence I found, how I communicated the blocker, and the next action. I would be clear about what I owned and what I learned.' },
]

export const glossary = [
  ['ABAP','SAP’s application programming language used to build and extend business applications.','Language','Open SQL, RAP'],
  ['ABAP Cloud','A cloud-ready ABAP development model using governed language versions and released APIs.','Development model','Clean Core, RAP'],
  ['ADT','ABAP Development Tools, the Eclipse-based environment for ABAP development.','Tooling','Eclipse, activation'],
  ['ALV','A family of SAP list viewer tools for presenting tabular business data.','UI / reporting','Field catalog, report'],
  ['BAPI','A standardized business API convention for accessing SAP business functionality.','Integration','RFC, business object'],
  ['CDS','Core Data Services, a modeling layer for semantically rich data models in ABAP.','Data modeling','View entity, association'],
  ['Clean Core','An approach to keep the standard ERP core upgrade-friendly through supported extensions.','Architecture','Released API, extension'],
  ['Client','A logical partition within an SAP system that scopes certain data and configuration.','System concept','Landscape, transport'],
  ['Data element','A Dictionary definition that adds semantic meaning and labels to a field type.','DDIC','Domain, field'],
  ['DDIC','ABAP Dictionary, repository objects that define and manage data types and database objects.','Data modeling','Domain, table'],
  ['Domain','A Dictionary object that defines technical properties and possible values for a field type.','DDIC','Data element'],
  ['Fiori Elements','SAP UI patterns that generate application pages from service metadata and annotations.','User interface','OData, annotations'],
  ['Internal table','A typed collection of rows held in ABAP program memory.','ABAP data','Structure, key'],
  ['OData','A web protocol for querying and manipulating resources through standard HTTP semantics.','Service protocol','RAP, service binding'],
  ['Open SQL','ABAP’s database-independent SQL interface for reading and changing data.','Data access','JOIN, CDS'],
  ['Package','A repository container used to organize development objects and their lifecycle.','Organization','Transport, object'],
  ['RAP','ABAP RESTful Application Programming Model for modeling and implementing ABAP business services.','Programming model','CDS, behavior'],
  ['RFC','Remote Function Call, a mechanism for communication with remote-enabled function modules.','Integration','BAPI'],
  ['S/4HANA','SAP’s ERP product family built around SAP HANA, with deployment- and release-specific options.','ERP','SAP, Clean Core'],
  ['Transport','A controlled collection of SAP changes moved between systems in a landscape.','Lifecycle','Package, client'],
  ['View entity','A modern ABAP CDS repository entity that defines a reusable modeled data shape.','CDS','Association, annotation'],
].map(([term, simple, technical, related]) => ({ term, simple, technical, related }))

export const officialResources = [
  { title: 'SAP Learning: ABAP Cloud Back-End Developer', url: 'https://learning.sap.com/learning-journeys/acquire-core-abap-skills', note: 'Start with current SAP learning journeys and navigate to the relevant ABAP Cloud path.' },
  { title: 'SAP Help: ABAP RESTful Application Programming Model', url: 'https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/cc80e974d128426d9d876d5a8fc9e4aa.html', note: 'Official RAP architecture and artifact concepts; select documentation for your platform release.' },
  { title: 'SAP Help: RAP development scenarios', url: 'https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/4cff5dff7f2642cab54e993c840a163e.html', note: 'End-to-end development guidance for RAP applications.' },
  { title: 'SAP Learning: certification', url: 'https://learning.sap.com/certifications', note: 'Verify current certification title, format, availability, and exam details before booking.' },
]
