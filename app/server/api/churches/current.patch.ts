import { db } from '../../utils/db'
import { UserRole } from '../../../types/auth'
import * as fs from 'fs'
import * as path from 'path'

// Base64 이미지를 저장하는 헬퍼 함수
const saveBase64Image = (base64Data: string, churchId: string, type: 'logo' | 'seal'): string => {
  // data:image/png;base64, 부분 분리
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
  if (!matches || matches.length !== 3) {
    throw new Error('올바르지 않은 이미지 형식입니다.')
  }
  
  const buffer = Buffer.from(matches[2], 'base64')
  // 확장자 추출 (간단하게 png로 통일하거나 MIME 타입에서 추출 가능하지만 여기서는 단순화)
  let extension = 'png'
  if (matches[1].includes('jpeg') || matches[1].includes('jpg')) extension = 'jpg'

  // public/uploads 폴더 경로 설정 (Nuxt 3 기준 루트 폴더의 public)
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  
  // 폴더가 없으면 생성
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  // 파일명 생성: churchId_logo.png
  const fileName = `${churchId}_${type}.${extension}`
  const filePath = path.join(uploadDir, fileName)

  // 파일 쓰기
  fs.writeFileSync(filePath, buffer)

  // 브라우저 캐시 방지를 위해 timestamp 추가
  return `/uploads/${fileName}?v=${Date.now()}`
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)
  
  // 미들웨어에서 주입된 context 정보
  const churchId = event.context.churchId || session.user.church_id
  const userRole = event.context.userRole

  // Admin(1) 또는 Master(0) 권한만 교회 정보 수정 가능
  if (userRole > UserRole.ADMIN) {
    throw createError({
      statusCode: 403,
      statusMessage: '교회 정보 수정 권한이 없습니다.'
    })
  }

  let { 
    name, 
    representative_name, 
    registration_number, 
    address, 
    phone_number,
    logo_image_path,
    seal_image_path,
    theme_color
  } = body

  try {
    // 1. 이미지 처리 로직 (Base64로 들어온 경우 파일로 저장하고 경로로 변환)
    if (logo_image_path && logo_image_path.startsWith('data:image')) {
      logo_image_path = saveBase64Image(logo_image_path, churchId, 'logo')
    }
    
    if (seal_image_path && seal_image_path.startsWith('data:image')) {
      seal_image_path = saveBase64Image(seal_image_path, churchId, 'seal')
    }

    // 2. DB 업데이트
    const updateData: any = {
      name,
      representative_name,
      registration_number,
      address,
      phone_number,
      updated_at: new Date()
    }

    if (logo_image_path !== undefined) updateData.logo_image_path = logo_image_path
    if (seal_image_path !== undefined) updateData.seal_image_path = seal_image_path
    if (theme_color !== undefined) updateData.theme_color = theme_color

    const result = await db.updateTable('churches')
      .set(updateData)
      .where('id', '=', churchId)
      .executeTakeFirst()

    if (Number(result.numUpdatedRows) === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '수정할 교회 정보를 찾을 수 없습니다.'
      })
    }

    return {
      success: true,
      message: '교회 정보가 성공적으로 업데이트되었습니다.',
      data: {
        logo_image_path,
        seal_image_path
      }
    }
  } catch (error: any) {
    console.error('Update current church error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '교회 정보를 업데이트하는 중 오류가 발생했습니다.'
    })
  }
})
