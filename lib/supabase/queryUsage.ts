import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function trackQueryUsage(ipAddress: string | null) {
  if (!ipAddress) {
    return { allowed: false, error: 'IP address not found' }
  }

  // Check if the IP has an existing record
  const { data: existingUsage, error: fetchError } = await supabase
    .from('query_usage')
    .select('*')
    .eq('ip_address', ipAddress)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    return { allowed: false, error: fetchError.message }
  }

  // If no existing record, create one
  if (!existingUsage) {
    const { error: insertError } = await supabase
      .from('query_usage')
      .insert({
        ip_address: ipAddress,
        query_count: 1,
        last_query_at: new Date().toISOString()
      })

    return insertError 
      ? { allowed: false, error: insertError.message }
      : { allowed: true, queryCount: 1 }
  }

  // Check if the record is from today
  const today = new Date().toISOString().split('T')[0]
  const lastQueryDate = new Date(existingUsage.last_query_at).toISOString().split('T')[0]

  // If it's a new day, reset the count
  if (today !== lastQueryDate) {
    const { error: updateError } = await supabase
      .from('query_usage')
      .update({
        query_count: 1,
        last_query_at: new Date().toISOString()
      })
      .eq('ip_address', ipAddress)

    return updateError 
      ? { allowed: false, error: updateError.message }
      : { allowed: true, queryCount: 1 }
  }

  // Check if query limit is exceeded
  if (existingUsage.query_count >= 5) {
    return { allowed: false, error: 'Daily query limit exceeded' }
  }

  // Increment query count
  const { error: updateError } = await supabase
    .from('query_usage')
    .update({
      query_count: existingUsage.query_count + 1,
      last_query_at: new Date().toISOString()
    })
    .eq('ip_address', ipAddress)

  return updateError 
    ? { allowed: false, error: updateError.message }
    : { allowed: true, queryCount: existingUsage.query_count + 1 }
}