-- Delete specific agents and all their related data
-- Agent IDs to delete:
-- FlySaver: 52d7f86d-7c6d-43ce-9d95-f2e29df1c028
-- HASBULLAH: 2a69c128-756c-454c-b132-a7d0676af8c2
-- Sim: ace2048f-fdca-4cf3-a510-a9343c31bcec
-- Ninjagowhale: b7bd09e3-757b-4815-aa2f-c4bd474c2bdb
-- Roshan: 8e0a9f76-fa69-40de-9bf7-ed9ed63bf137
-- Jethro: b3945f85-aa13-4624-89ca-94fdc0c59458
-- Saloony: 1ffc31e6-2c16-421f-adc9-377263d864d1
-- @tadayuhi0202: 6f857f49-fd8e-47ce-9863-9a0e1667e146

-- Delete from dependent tables first
DELETE FROM advisor_documents WHERE advisor_id IN (
  '52d7f86d-7c6d-43ce-9d95-f2e29df1c028',
  '2a69c128-756c-454c-b132-a7d0676af8c2',
  'ace2048f-fdca-4cf3-a510-a9343c31bcec',
  'b7bd09e3-757b-4815-aa2f-c4bd474c2bdb',
  '8e0a9f76-fa69-40de-9bf7-ed9ed63bf137',
  'b3945f85-aa13-4624-89ca-94fdc0c59458',
  '1ffc31e6-2c16-421f-adc9-377263d864d1',
  '6f857f49-fd8e-47ce-9863-9a0e1667e146'
);

DELETE FROM advisor_embeddings WHERE advisor_id IN (
  '52d7f86d-7c6d-43ce-9d95-f2e29df1c028',
  '2a69c128-756c-454c-b132-a7d0676af8c2',
  'ace2048f-fdca-4cf3-a510-a9343c31bcec',
  'b7bd09e3-757b-4815-aa2f-c4bd474c2bdb',
  '8e0a9f76-fa69-40de-9bf7-ed9ed63bf137',
  'b3945f85-aa13-4624-89ca-94fdc0c59458',
  '1ffc31e6-2c16-421f-adc9-377263d864d1',
  '6f857f49-fd8e-47ce-9863-9a0e1667e146'
);

DELETE FROM conversation_embeddings WHERE advisor_id IN (
  '52d7f86d-7c6d-43ce-9d95-f2e29df1c028',
  '2a69c128-756c-454c-b132-a7d0676af8c2',
  'ace2048f-fdca-4cf3-a510-a9343c31bcec',
  'b7bd09e3-757b-4815-aa2f-c4bd474c2bdb',
  '8e0a9f76-fa69-40de-9bf7-ed9ed63bf137',
  'b3945f85-aa13-4624-89ca-94fdc0c59458',
  '1ffc31e6-2c16-421f-adc9-377263d864d1',
  '6f857f49-fd8e-47ce-9863-9a0e1667e146'
);

DELETE FROM conversation_captures WHERE advisor_id IN (
  '52d7f86d-7c6d-43ce-9d95-f2e29df1c028',
  '2a69c128-756c-454c-b132-a7d0676af8c2',
  'ace2048f-fdca-4cf3-a510-a9343c31bcec',
  'b7bd09e3-757b-4815-aa2f-c4bd474c2bdb',
  '8e0a9f76-fa69-40de-9bf7-ed9ed63bf137',
  'b3945f85-aa13-4624-89ca-94fdc0c59458',
  '1ffc31e6-2c16-421f-adc9-377263d864d1',
  '6f857f49-fd8e-47ce-9863-9a0e1667e146'
);

DELETE FROM contact_messages WHERE advisor_id IN (
  '52d7f86d-7c6d-43ce-9d95-f2e29df1c028',
  '2a69c128-756c-454c-b132-a7d0676af8c2',
  'ace2048f-fdca-4cf3-a510-a9343c31bcec',
  'b7bd09e3-757b-4815-aa2f-c4bd474c2bdb',
  '8e0a9f76-fa69-40de-9bf7-ed9ed63bf137',
  'b3945f85-aa13-4624-89ca-94fdc0c59458',
  '1ffc31e6-2c16-421f-adc9-377263d864d1',
  '6f857f49-fd8e-47ce-9863-9a0e1667e146'
);

DELETE FROM daily_briefs WHERE advisor_id IN (
  '52d7f86d-7c6d-43ce-9d95-f2e29df1c028',
  '2a69c128-756c-454c-b132-a7d0676af8c2',
  'ace2048f-fdca-4cf3-a510-a9343c31bcec',
  'b7bd09e3-757b-4815-aa2f-c4bd474c2bdb',
  '8e0a9f76-fa69-40de-9bf7-ed9ed63bf137',
  'b3945f85-aa13-4624-89ca-94fdc0c59458',
  '1ffc31e6-2c16-421f-adc9-377263d864d1',
  '6f857f49-fd8e-47ce-9863-9a0e1667e146'
);

DELETE FROM escalation_rules WHERE advisor_id IN (
  '52d7f86d-7c6d-43ce-9d95-f2e29df1c028',
  '2a69c128-756c-454c-b132-a7d0676af8c2',
  'ace2048f-fdca-4cf3-a510-a9343c31bcec',
  'b7bd09e3-757b-4815-aa2f-c4bd474c2bdb',
  '8e0a9f76-fa69-40de-9bf7-ed9ed63bf137',
  'b3945f85-aa13-4624-89ca-94fdc0c59458',
  '1ffc31e6-2c16-421f-adc9-377263d864d1',
  '6f857f49-fd8e-47ce-9863-9a0e1667e146'
);

DELETE FROM x_agent_purchases WHERE agent_id IN (
  '52d7f86d-7c6d-43ce-9d95-f2e29df1c028',
  '2a69c128-756c-454c-b132-a7d0676af8c2',
  'ace2048f-fdca-4cf3-a510-a9343c31bcec',
  'b7bd09e3-757b-4815-aa2f-c4bd474c2bdb',
  '8e0a9f76-fa69-40de-9bf7-ed9ed63bf137',
  'b3945f85-aa13-4624-89ca-94fdc0c59458',
  '1ffc31e6-2c16-421f-adc9-377263d864d1',
  '6f857f49-fd8e-47ce-9863-9a0e1667e146'
);

DELETE FROM x_agent_offerings WHERE agent_id IN (
  '52d7f86d-7c6d-43ce-9d95-f2e29df1c028',
  '2a69c128-756c-454c-b132-a7d0676af8c2',
  'ace2048f-fdca-4cf3-a510-a9343c31bcec',
  'b7bd09e3-757b-4815-aa2f-c4bd474c2bdb',
  '8e0a9f76-fa69-40de-9bf7-ed9ed63bf137',
  'b3945f85-aa13-4624-89ca-94fdc0c59458',
  '1ffc31e6-2c16-421f-adc9-377263d864d1',
  '6f857f49-fd8e-47ce-9863-9a0e1667e146'
);

DELETE FROM sim_likes WHERE sim_id IN (
  '52d7f86d-7c6d-43ce-9d95-f2e29df1c028',
  '2a69c128-756c-454c-b132-a7d0676af8c2',
  'ace2048f-fdca-4cf3-a510-a9343c31bcec',
  'b7bd09e3-757b-4815-aa2f-c4bd474c2bdb',
  '8e0a9f76-fa69-40de-9bf7-ed9ed63bf137',
  'b3945f85-aa13-4624-89ca-94fdc0c59458',
  '1ffc31e6-2c16-421f-adc9-377263d864d1',
  '6f857f49-fd8e-47ce-9863-9a0e1667e146'
);

DELETE FROM user_advisors WHERE advisor_id IN (
  '52d7f86d-7c6d-43ce-9d95-f2e29df1c028',
  '2a69c128-756c-454c-b132-a7d0676af8c2',
  'ace2048f-fdca-4cf3-a510-a9343c31bcec',
  'b7bd09e3-757b-4815-aa2f-c4bd474c2bdb',
  '8e0a9f76-fa69-40de-9bf7-ed9ed63bf137',
  'b3945f85-aa13-4624-89ca-94fdc0c59458',
  '1ffc31e6-2c16-421f-adc9-377263d864d1',
  '6f857f49-fd8e-47ce-9863-9a0e1667e146'
);

-- Delete messages related to conversations with these advisors
DELETE FROM messages WHERE conversation_id IN (
  SELECT id FROM conversations WHERE advisor_id IN (
    '52d7f86d-7c6d-43ce-9d95-f2e29df1c028',
    '2a69c128-756c-454c-b132-a7d0676af8c2',
    'ace2048f-fdca-4cf3-a510-a9343c31bcec',
    'b7bd09e3-757b-4815-aa2f-c4bd474c2bdb',
    '8e0a9f76-fa69-40de-9bf7-ed9ed63bf137',
    'b3945f85-aa13-4624-89ca-94fdc0c59458',
    '1ffc31e6-2c16-421f-adc9-377263d864d1',
    '6f857f49-fd8e-47ce-9863-9a0e1667e146'
  )
);

-- Delete conversations
DELETE FROM conversations WHERE advisor_id IN (
  '52d7f86d-7c6d-43ce-9d95-f2e29df1c028',
  '2a69c128-756c-454c-b132-a7d0676af8c2',
  'ace2048f-fdca-4cf3-a510-a9343c31bcec',
  'b7bd09e3-757b-4815-aa2f-c4bd474c2bdb',
  '8e0a9f76-fa69-40de-9bf7-ed9ed63bf137',
  'b3945f85-aa13-4624-89ca-94fdc0c59458',
  '1ffc31e6-2c16-421f-adc9-377263d864d1',
  '6f857f49-fd8e-47ce-9863-9a0e1667e146'
);

-- Finally, delete the advisors themselves
DELETE FROM advisors WHERE id IN (
  '52d7f86d-7c6d-43ce-9d95-f2e29df1c028',
  '2a69c128-756c-454c-b132-a7d0676af8c2',
  'ace2048f-fdca-4cf3-a510-a9343c31bcec',
  'b7bd09e3-757b-4815-aa2f-c4bd474c2bdb',
  '8e0a9f76-fa69-40de-9bf7-ed9ed63bf137',
  'b3945f85-aa13-4624-89ca-94fdc0c59458',
  '1ffc31e6-2c16-421f-adc9-377263d864d1',
  '6f857f49-fd8e-47ce-9863-9a0e1667e146'
);