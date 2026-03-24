
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pxmeoibtuhaxwoywbpyo.supabase.co';
const supabaseKey = 'sb_publishable_ce6oABzdZ0fuoRDIkq9peA_o8QjSXX1';

export const supabase = createClient(supabaseUrl, supabaseKey);
