import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyWorldID, validateWorldIDVerification, generateUserIdFromNullifier } from '@/lib/worldid'
import { generateSatiricalUsername } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    if (!validateWorldIDVerification(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid World ID verification data' },
        { status: 400 }
      )
    }

    // Verify World ID proof
    const verificationResult = await verifyWorldID(body, 'login')
    
    if (!verificationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: verificationResult.error || 'World ID verification failed' 
        },
        { status: 401 }
      )
    }

    // Generate user ID from nullifier hash
    const userId = generateUserIdFromNullifier(body.nullifier_hash)
    
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('world_id', body.nullifier_hash)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      )
    }

    let user = existingUser

    // Create new user if doesn't exist
    if (!user) {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          world_id: body.nullifier_hash,
          username: generateSatiricalUsername(),
          region: 'global'
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json(
          { success: false, error: 'Failed to create user' },
          { status: 500 }
        )
      }

      user = newUser
    }

    // Create JWT token for the user
    const { data: { session }, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: `${user.id}@worldcoin.local`, // Fake email for World ID users
      options: {
        data: {
          world_id: body.nullifier_hash,
          verification_level: body.verification_level
        }
      }
    })

    if (sessionError || !session) {
      console.error('Error creating session:', sessionError)
      return NextResponse.json(
        { success: false, error: 'Failed to create session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          worldId: user.world_id,
          username: user.username,
          avatar: user.avatar,
          region: user.region,
          createdAt: user.created_at
        },
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at
        }
      }
    })

  } catch (error) {
    console.error('Auth verify error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

