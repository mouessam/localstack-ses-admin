import { z } from 'zod';

export const IdentityTypeSchema = z.enum(['email', 'domain']);
export type IdentityType = z.infer<typeof IdentityTypeSchema>;

export const IdentitySchema = z.object({
  identity: z.string().min(3),
  type: IdentityTypeSchema,
});
export type Identity = z.infer<typeof IdentitySchema>;

export const ListIdentitiesResponseSchema = z.object({
  items: z.array(IdentitySchema),
});
export type ListIdentitiesResponse = z.infer<typeof ListIdentitiesResponseSchema>;

export const SendEmailSchema = z
  .object({
    from: z.string().min(3),
    to: z.array(z.string().min(3)).min(1),
    cc: z.array(z.string().min(3)).optional(),
    bcc: z.array(z.string().min(3)).optional(),
    subject: z.string().min(1),
    text: z.string().optional(),
    html: z.string().optional(),
  })
  .refine((value) => Boolean(value.text || value.html), {
    message: 'Either text or html is required',
    path: ['text'],
  });
export type SendEmailInput = z.infer<typeof SendEmailSchema>;

export const SendRawSchema = z
  .object({
    from: z.string().min(3),
    to: z.array(z.string().min(3)).min(1),
    cc: z.array(z.string().min(3)).optional(),
    bcc: z.array(z.string().min(3)).optional(),
    subject: z.string().min(1),
    text: z.string().optional(),
    html: z.string().optional(),
    raw: z.string().optional(),
  })
  .refine((value) => Boolean(value.raw || value.text || value.html), {
    message: 'Raw or text/html is required',
    path: ['raw'],
  });
export type SendRawInput = z.infer<typeof SendRawSchema>;

export const MessageSchema = z
  .object({
    id: z.string().optional(),
    to: z.array(z.string()).optional(),
    from: z.string().optional(),
    subject: z.string().optional(),
    body: z.string().optional(),
    timestamp: z.string().optional(),
  })
  .passthrough();
export type Message = z.infer<typeof MessageSchema>;

export const ListMessagesResponseSchema = z.object({
  messages: z.array(MessageSchema),
});
export type ListMessagesResponse = z.infer<typeof ListMessagesResponseSchema>;
