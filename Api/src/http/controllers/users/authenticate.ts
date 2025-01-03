import { InvalidCredentialsError } from "@/service/errors/invalid-credentials-error";
import { makeAuthenticateService } from "@/service/factories/user/make-authenticate-service";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    const authenticateBodySchema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
    })

    const { email, password } = authenticateBodySchema.parse(request.body)

    try {
        const authenticateService = makeAuthenticateService()

        const { user } = await authenticateService.execute({ email, password })

        const token = await reply.jwtSign({}, {
            sign: {
                sub: user.id
            },
        })

        // const refreshToken = await reply.jwtSign({
        //     sign: {
        //         sub: user.id,
        //         expiresIn: '7d',
        //     },
        // })

        return reply.status(200).send({ token })

    } catch (error) {
        if (error instanceof InvalidCredentialsError) {
            return reply.status(401).send({ message: error.message })
        }
        throw error
    }
}